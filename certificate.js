const forge = require('node-forge');
const fs = require('fs');
const KEY_FILE_PATH = `./data/key.pem`;
const CERT_FILE_PATH = `./data/cert.pem`;

class Certificate {

    generate (hostName) {
        const keys = forge.pki.rsa.generateKeyPair(2048)

        const cert = forge.pki.createCertificate()
        cert.publicKey = keys.publicKey
        cert.serialNumber = '01'
        cert.validity.notBefore = new Date()
        {
          const expirationDate = new Date()
          expirationDate.setFullYear(expirationDate.getFullYear() + 1)
          cert.validity.notAfter = expirationDate
        }
      
        {
          const attrs = [
            {name: 'commonName', value: hostName},
            {name: 'countryName', value: 'US'},
            {shortName: 'ST', value: 'California'},
            {name: 'localityName', value: 'VueLand'},
            {name: 'organizationName', value: 'Vuindows'},
            {shortName: 'OU', value: 'Test'}
          ]
          cert.setSubject(attrs)
          cert.setIssuer(attrs)
        }
      
        cert.sign(keys.privateKey)
      
        return {
          cert: forge.pki.certificateToPem(cert),
          key: forge.pki.privateKeyToPem(keys.privateKey)
        }
    }

    get (host) {
        if (!fs.existsSync(KEY_FILE_PATH)) {
            console.log("Generting SSL certificate");
            const cert = this.generate(host);

            fs.writeFile(KEY_FILE_PATH, cert.key, () => {});
            fs.writeFile(CERT_FILE_PATH, cert.cert, () => {});
            return cert;
        }

        return {
            key: fs.readFileSync(KEY_FILE_PATH),
            cert: fs.readFileSync(CERT_FILE_PATH)
        };
    }

}

module.exports = Certificate;