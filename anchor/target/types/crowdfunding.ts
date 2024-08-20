/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/crowdfunding.json`.
 */
export type Crowdfunding = {
  "address": "5dWX9UvibREvTPvU1zC7woKngTV1YfsXAqm1rDzezNSg",
  "metadata": {
    "name": "crowdfunding",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createCampaign",
      "discriminator": [
        111,
        131,
        187,
        98,
        160,
        193,
        114,
        244
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "campaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "arg",
                "path": "id"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "targetAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [],
      "args": []
    },
    {
      "name": "registerCreator",
      "discriminator": [
        85,
        3,
        194,
        210,
        164,
        140,
        160,
        195
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "creatorUsername",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  110,
                  97,
                  109,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "username"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "username",
          "type": "string"
        },
        {
          "name": "fullname",
          "type": "string"
        },
        {
          "name": "bio",
          "type": "string"
        }
      ]
    },
    {
      "name": "supportCreator",
      "discriminator": [
        162,
        115,
        57,
        64,
        112,
        75,
        21,
        43
      ],
      "accounts": [
        {
          "name": "supporter",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator",
          "writable": true
        },
        {
          "name": "receiver",
          "writable": true
        },
        {
          "name": "supporterTransfer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  112,
                  112,
                  111,
                  114,
                  116,
                  101,
                  114,
                  84,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "account",
                "path": "creator.supporters_count",
                "account": "creator"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "message",
          "type": "string"
        },
        {
          "name": "itemType",
          "type": "string"
        },
        {
          "name": "quantity",
          "type": "u16"
        },
        {
          "name": "price",
          "type": "f64"
        }
      ]
    },
    {
      "name": "updateCreator",
      "discriminator": [
        39,
        221,
        251,
        213,
        194,
        161,
        31,
        207
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "username"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "username",
          "type": "string"
        },
        {
          "name": "fullname",
          "type": "string"
        },
        {
          "name": "bio",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "campaign",
      "discriminator": [
        50,
        40,
        49,
        11,
        157,
        220,
        229,
        192
      ]
    },
    {
      "name": "creator",
      "discriminator": [
        237,
        37,
        233,
        153,
        165,
        132,
        54,
        103
      ]
    },
    {
      "name": "creatorUsername",
      "discriminator": [
        213,
        232,
        22,
        26,
        139,
        83,
        205,
        14
      ]
    },
    {
      "name": "supporterTransfer",
      "discriminator": [
        194,
        22,
        127,
        36,
        178,
        170,
        242,
        78
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "usernameAlreadyExists",
      "msg": "Username already exists"
    },
    {
      "code": 6001,
      "name": "invalidTransferAmount",
      "msg": "Transfer amount is invalid"
    }
  ],
  "types": [
    {
      "name": "campaign",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "targetAmount",
            "type": "u64"
          },
          {
            "name": "amountDonated",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "creator",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "username",
            "type": "string"
          },
          {
            "name": "fullname",
            "type": "string"
          },
          {
            "name": "bio",
            "type": "string"
          },
          {
            "name": "imageUrl",
            "type": "string"
          },
          {
            "name": "displaySupportersCount",
            "type": "bool"
          },
          {
            "name": "pricePerDonation",
            "type": "u64"
          },
          {
            "name": "donationItem",
            "type": "string"
          },
          {
            "name": "thankYouMessage",
            "type": "string"
          },
          {
            "name": "supportersCount",
            "type": "u64"
          },
          {
            "name": "availableFunds",
            "type": "u64"
          },
          {
            "name": "withdrawnFunds",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "creatorUsername",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "supporterTransfer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "supporter",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "message",
            "type": "string"
          },
          {
            "name": "transferAmount",
            "type": "f64"
          },
          {
            "name": "itemType",
            "type": "string"
          },
          {
            "name": "quantity",
            "type": "u16"
          },
          {
            "name": "price",
            "type": "f64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "seed",
      "type": "string",
      "value": "\"anchor\""
    }
  ]
};
