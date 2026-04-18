"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFailureReason = exports.getARecords = void 0;
exports.isTxtRecordPresent = isTxtRecordPresent;
exports.isARecordPresent = isARecordPresent;
const constants_1 = require("@onlook/constants");
const dns_1 = require("dns");
const tldts_1 = require("tldts");
const getARecords = (subdomain) => {
    if (!subdomain) {
        return [{
                type: 'A',
                name: '@',
                value: constants_1.FREESTYLE_IP_ADDRESS,
                verified: false,
            }, {
                type: 'A',
                name: 'www',
                value: constants_1.FREESTYLE_IP_ADDRESS,
                verified: false,
            }];
    }
    return [
        {
            type: 'A',
            name: subdomain,
            value: constants_1.FREESTYLE_IP_ADDRESS,
            verified: false,
        },
    ];
};
exports.getARecords = getARecords;
const getFailureReason = async (verification) => {
    const errors = [];
    const txtRecord = verification.txtRecord;
    const txtRecordResponse = await isTxtRecordPresent(verification.fullDomain, txtRecord.name, txtRecord.value);
    if (!txtRecordResponse.isPresent) {
        let txtError = `TXT Record Missing:\n`;
        txtError += `    Expected:\n`;
        txtError += `        host: ${txtRecord.name}\n`;
        txtError += `        value: "${txtRecord.value}"\n`;
        if (txtRecordResponse.foundRecords.length > 0) {
            txtError += `    Found:\n`;
            txtError += `        value: ${txtRecordResponse.foundRecords.map(record => `"${record}"`).join(', ')}`;
        }
        else {
            txtError += `    Found: No TXT records`;
        }
        errors.push(txtError);
    }
    const aRecords = verification.aRecords;
    for (const aRecord of aRecords) {
        const aRecordResponse = await isARecordPresent(verification.fullDomain, aRecord.value);
        if (!aRecordResponse.isPresent) {
            let aError = `A Record Missing:\n`;
            aError += `    Expected:\n`;
            aError += `        host: ${aRecord.name}\n`;
            aError += `        value: ${aRecord.value}\n`;
            if (aRecordResponse.foundRecords.length > 0) {
                aError += `    Found:\n`;
                aError += `        value: ${aRecordResponse.foundRecords.join(', ')}`;
            }
            else {
                aError += `    Found: No A records`;
            }
            errors.push(aError);
        }
    }
    errors.push('DNS records may take up to 24 hours to update');
    return errors.join('\n\n');
};
exports.getFailureReason = getFailureReason;
async function isTxtRecordPresent(fullDomain, name, expectedValue) {
    try {
        const parsedDomain = (0, tldts_1.parse)(fullDomain);
        if (!parsedDomain.domain) {
            return {
                isPresent: false,
                foundRecords: [],
            };
        }
        const domain = parsedDomain.domain ?? fullDomain;
        const records = await dns_1.promises.resolveTxt(`${name}.${domain}`);
        const foundRecords = records.map(entry => entry.join(''));
        return {
            isPresent: foundRecords.includes(expectedValue),
            foundRecords,
        };
    }
    catch {
        return {
            isPresent: false,
            foundRecords: [],
        };
    }
}
async function isARecordPresent(name, expectedIp) {
    try {
        const records = await dns_1.promises.resolve4(name);
        return {
            isPresent: records.includes(expectedIp),
            foundRecords: records,
        };
    }
    catch {
        return {
            isPresent: false,
            foundRecords: [],
        };
    }
}
//# sourceMappingURL=records.js.map