let data:any ={
  "tgw4_dpd": {
    "encryptionType": {
      "name": "encryptionType",
      "_type": "select",
      "selectionList": [
        "vault",
        "AESGCM",
        "AESCTR",
        "RSA",
        "PKI"
      ],
      "value": "",
      "enabled": true
    },
    "encryptionInfo": {
      "name": "encryptionInfo",
      "_type": "array",
      "items": [
        {
          "type": "vault",
          "url": "",
          "key": "",
          "token": ""
        },
        {
          "type": "AESGCM",
          "mode": "aes-256-gcm",
          "Key": "",
          "IVlength": ""
        },
        {
          "type": "AESCTR",
          "mode": "aes-256-ctr",
          "Key": "",
          "IVlength": ""
        },
        {
          "type": "RSA",
          "privateKey": "",
          "publicKey": ""
        },
        {
          "type": "PKI",
          "privateKey": "",
          "publicKey": ""
        }
      ],
      "enabled": true
    }
  }
};

const getEnvData = (dpdKey: string,method: string) => {
  let artifactName = dpdKey.split(":")[11];
  let result:any =data[artifactName]
  return result;
}
export default getEnvData