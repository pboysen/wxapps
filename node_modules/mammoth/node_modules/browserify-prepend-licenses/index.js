var path = require("path");

var bluebird = require("bluebird");
var through = require("through2");
var licenseSniffer = require("license-sniffer");

var sniffLicense = bluebird.promisify(licenseSniffer.sniff);

module.exports = function(b, options) {
    var packageIds;
    var licenses;
    var prepended;
    
    function reset() {
        packageIds = [];
        licenses = {};
        prepended = false;
    }
    
    reset();
    b.on("reset", reset);
    
    b.on("package", function(package) {
        var id = packageId(package);
        packageIds.push(id);
        licenses[id] = sniffLicense(package.__dirname, {generateBody: false})
            .then(function(license) {
                if (license.isKnown()) {
                    return license.names[0];
                } else {
                    throw new Error("Could not find license for " + id);
                }
            });
    });
    
    b.pipeline.get("wrap").push(through.obj(function(row, enc, next) {
        if (prepended) {
            this.push(row);
            next();
        } else {
            prepended = true;
            var self = this;
            packageIds.sort();
            bluebird.props(licenses).then(function(licenses) {
                var licenseText = packageIds.map(function(id) {
                    var license = licenses[id];
                    return (
                        "// Module: " + id + "\n" +
                        "// License: " + license + "\n" +
                        "//\n"
                    );
                }).join("");
                self.push(new Buffer(licenseText, "utf-8"));
                self.push(row);
                next();
            }, next);
        }
    }));
};

function packageId(package) {
    return package.name + "@" + package.version;
}

