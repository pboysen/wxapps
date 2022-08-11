import {getStore} from "../utils"
let store = getStore()

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1))
        var temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
    return array;
}

/*
 * Given a list of students each which have one or more chcsize choices, assign to teams so that each
 * team has one or more representatives from each choice.
 * 
 * The algorithm begins by creating an array of choice_team indices. Each choice_team index represents the next team that
 * doesn't have at least one student in that choice. 
 * 
 * For each student, look for a team that does not have a member in one of the choices this student represents.
 * If there are none, the student is added to the first team that does not yet have teamsize members.
 * 
 * At completion all students have been considered and added to a team.  The teams array contains the team membership.
 */
class Student {
	constructor(id,choices) {
		this.id = id
		this.choices = choices // array of choice indices. Example: [0,3] for choice 0 and 3
	}
	
	get id() { return this.id }
}

class Team {
	constructor(id,chcsize,teamsize) {
		this.id = id
		this.teamsize = teamsize
		this.students = []
		this.chccnt = [] // number students in each category
		for (let c = 0; c < chcsize; c++) this.chccnt = this.chccnt.concat(0)
	}
	
	getMembers() {
		let list = ""
		this.students.forEach(s => list += s.name+",")
		return list.slice(0,-1)
	}
	
	getMemberIndex(s) {
		for (let i = 0; i < this.students.length; i++)
			if (this.students[i].id == this.id) return i
		return -1
	}
		
	isFull() { return this.students.length == this.teamsize }
	
	canAdd(c,n) { return this.chccnt[c] < n && !this.isFull() }
	
	addStudent(s) { 
		this.students = this.students.concat(s)
		for (let c = 0; c < s.choices.length; c++)
			this.chccnt[s.choices[c]]++
	}
}

class TeamBuilder {
	constructor(settings) {
		this.settings = settings
		this.assign = document.getElementById("assign")
		this.assign.addEventListener("click", e => {
			this.settings.saveChoices()
			this.populateTeams()
			this.display()
		})
		this.students = []
		this.teams = []
		this.settings.updateChoices()
	}
	
	// generate a population for testing
	generateStudents() {
		let nstu = this.settings.getStudents(), chcdata = this.settings.getChoiceData(), popchc = []
		// compute the distribution students in each choice
		chcdata.forEach(chc => popchc = popchc.concat(parseInt(nstu*chc.wt/100)))
		this.students = []
    	for (let s = 0; s < nstu; s++) {
    		// determine which choices the student has selected
    		let choices = []
    		let q = 0
    		for (let c = 0; c < chcdata.length; c++) {
    			// restart look for choice when question changes
    			if (q > 0 && q != chcdata[c].q) q = 0
    			if (popchc[c] > 0 && !q) {
    				popchc[c]--
    				choices = choices.concat(c)
    				q = chcdata[c].q
    			}
    		}
    		this.students = this.students.concat(new Student(s,choices))
    	}
		shuffle(this.students)
	}
	
	populateTeams() {
		this.generateStudents()
		let choiceData = this.settings.getChoiceData()
		this.chcsize = choiceData.length
		this.teamsize = this.settings.getTeams()
		this.nteams = parseInt(this.students.length/this.teamsize)
		if (this.students.length % this.teamsize != 0) this.nteams++
		this.teams = []
		for (let t = 0; t < this.nteams; t++) this.teams = this.teams.concat(new Team(t,this.chcsize,this.teamsize))
		// add student to student array for each choice
		for (let s = 0; s < this.students.length; s++) {
			let student = this.students[s]
			for (let i = 0; i < student.choices.length; i++) {
				let c = student.choices[i]
				choiceData[c].students = choiceData[c].students.concat(s)
			}
		}
	}
	
	display() {
		let table = document.getElementById("cattable2")
		for (let r = table.rows.length-1; r >= 0; r--) table.deleteRow(r)
		let chcdata = this.settings.getChoiceData()
		let row = table.insertRow(0)
		row.insertCell(0).outerHTML = "<th>Team</th>"
		row.insertCell(1).outerHTML = "<th>Members</th>"
		for (let c = 0; c < chcdata.length; c++)
			row.insertCell(c+2).outerHTML = "<th>"+chcdata[c].name+"</th>"
		for (let t = 0; t < this.teams.length; t++) {
			let row = table.insertRow(t+1)
			row.insertCell(0).innerHTML = String(t)
			row.insertCell(1).innerHTML = this.teams[t].getMembers()
			for (let c = 0; c < chcdata.length; c++)
				row.insertCell(c+2).outerHTML = "<td>"+this.teams[t].chccnt[c]+"</td>"
		}
	}
}

class Settings {
	constructor() {
		this.size = document.getElementById("size")
		this.team = document.getElementById("team")
		this.choice = document.getElementById("choice")
		this.choice.addEventListener("change", e => {
			this.buildInputTable()
		})
	}

	getStudents() { return parseInt(this.size.value) }
	
	getTeams() { return parseInt(this.team.value) }

	getChoices() { return parseInt(this.choice.value) }
	
	updateChoices() {
		let tbchoices = store.get("tbchoices")
		if (!tbchoices) return
		this.size.value = tbchoices.size
		this.choice.value = tbchoices.choice
		this.team.value = tbchoices.team
		this.buildInputTable()
		let table = document.getElementById("cattable1")
		for (let r = 0; r < tbchoices.data.length; r++) {
			let datarow = tbchoices.data[r]
			let row = table.rows[r+1]
			row.cells[0].firstChild.value = datarow.q
			row.cells[1].firstChild.value = datarow.name
			row.cells[2].firstChild.value = datarow.wt
		}
	}
	
	saveChoices() {
		let tbchoices = {size: this.getStudents(), team: this.getTeams(), choice: this.getChoices(), data: this.getChoiceData()}
		store.set("tbchoices",tbchoices)
	}
	
	getChoiceData() {
		let data = []
		let table = document.getElementById("cattable1")
		for (let r = 1; r < table.rows.length; r++) {
			let row = table.rows[r]
			let q = row.cells[0].firstChild.value
			let name = row.cells[1].firstChild.value
			let wt = row.cells[2].firstChild.value
			if (q.length > 0 && name.length > 0 && wt.length > 0) data = data.concat({q: q, name: name, wt: wt, students:[]})
		}
		return data
	}
	
	getInput(sz,type) {
		let input = document.createElement("input")
		input.setAttribute("size",sz)
		input.setAttribute("type",type)
		return input
	}
 	
	buildInputTable() {
		let table = document.getElementById("cattable1")
		let nrows = this.getChoices()+1
		if (table.rows.length < nrows)
			for (let i = table.rows.length; i < nrows; i++) {
				let row = table.insertRow(i)
				row.insertCell(0).appendChild(this.getInput(2,"text"))
				row.insertCell(1).appendChild(this.getInput(20,"text"))
				row.insertCell(2).appendChild(this.getInput(3,"text"))
			}
		else if (table.rows.length > nrows)
			for (let i = table.rows.length-1; i >= nrows; i--)
				table.deleteRow(i)
	}
}

let tb = new TeamBuilder(new Settings())
