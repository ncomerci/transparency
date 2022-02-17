const Utils = require('./utils.js');
const balances = require('./public/balances.json');
const transactions = require('./public/transactions.json');
const grants = require('./public/grants.json');

const sumQuote = txs => txs.reduce((total, tx) => total + tx.quote, 0);

async function main() {

    var now = new Date();
    var last30 = new Date(now - (1000 * 3600 * 24 * 30)).toISOString();
    var last60 = new Date(now - (1000 * 3600 * 24 * 60)).toISOString();

    var incomeTxs = transactions.filter(tx => tx.type == 'IN');
    var incomeTxs30 = incomeTxs.filter(tx => tx.date >= last30);
    var totalIncome30 = sumQuote(incomeTxs30);

    var incomeTxs60 = incomeTxs.filter(tx => tx.date >= last60 && tx.date < last30);
    var totalIncome60 = sumQuote(incomeTxs60);
    var delta = (totalIncome30 - totalIncome60) * 100 / totalIncome60;

    var totalVesting = sumQuote(incomeTxs30.filter(tx => tx.tag == 'Vesting Contract'));
    var totalETHMarket = sumQuote(incomeTxs30.filter(tx => tx.tag == 'ETH Marketplace'));
    var totalMATICMarket = sumQuote(incomeTxs30.filter(tx => tx.tag == 'MATIC Marketplace'));
    var totalOpenSea = sumQuote(incomeTxs30.filter(tx => tx.tag == 'OpenSea'));
    var otherIncome = totalIncome30 - totalVesting - totalETHMarket - totalMATICMarket - totalOpenSea;

    var expensesTxs = transactions.filter(tx => tx.type == 'OUT');
    var expensesTxs30 = expensesTxs.filter(tx => tx.date >= last30);
    var totalExpenses30 = sumQuote(expensesTxs30);

    var expensesTxs60 = incomeTxs.filter(tx => tx.date >= last60 && tx.date < last30);
    var totalExpenses60 = sumQuote(expensesTxs60);
    var delta = (totalExpenses30 - totalExpenses60) * 100 / totalExpenses60;

    var totalFacilitator = sumQuote(expensesTxs30.filter(tx => tx.tag == 'Facilitator'));
    var totalCurators = sumQuote(expensesTxs30.filter(tx => tx.tag == 'Curator'));
    var totalGrants = sumQuote(expensesTxs30.filter(tx => tx.tag == 'Grant'));
    var otherExpenses = totalExpenses30 - totalFacilitator - totalGrants - totalCurators;

    var totalFunding = grants.filter(g => g.status == 'enacted').reduce((a, g) => a + g.grant_size, 0);

    const data = {
        'balances': balances,
        'income': {
            'total': totalIncome30,
            'previous': delta,
            'details': [
                {'name': 'Vesting Contract', 'value': totalVesting},
                {'name': 'ETH DCL Marketplace', 'value': totalETHMarket},
                {'name': 'MATIC DCL Marketplace', 'value': totalMATICMarket},
                {'name': 'OpenSea Marketplace', 'value': totalOpenSea},
                {'name': 'Other', 'value': otherIncome},
            ]
        },
        'expenses': {
            'total': totalExpenses30,
            'previous': delta,
            'details': [
                {'name': 'Curation Committee', 'value': totalCurators},
                {'name': 'DAO Facilitator', 'value': totalFacilitator},
                {'name': 'Grants', 'value': totalGrants},
                {'name': 'Other', 'value': otherExpenses},
            ]
        },
        'funding': {
            'total': totalFunding,
        },
        'teams': [
            {
                'name': 'Security Advisory Board',
                'description': "Responsable to overview the sensible operations of the DAO, with the power to halt operations initiated by the DAO Committee or the Community. They advise in the best course of action for technical operations involving the DAO's smart contracts.",
                'members': [
                    {'address': '0xbcac4dafb7e215f2f6cb3312af6d5e4f9d9e7eda', 'name': 'Ignacio', 'url': 'https://decentraland.org/images/male.png'},
                    {'address': '0xfc4ef0903bb924d06db9cbaba1e4bda6b71d2f82', 'name': 'Brett', 'url': 'https://decentraland.org/images/male.png'},
                    {'address': '0x48850327b81D0c924Ad212891C7223c2ea5Cd426', 'name': 'Kyllian', 'url': 'https://peer.decentraland.org/content/contents/QmawhssHwbFsSNfW47bvkUtXq7CzitxQ3idzYoWeZBaYJX'},
                    {'address': '0x42ebd2ab698ba74eec1d2a81c376ea2c38c05249', 'name': 'Agustin', 'url': 'https://decentraland.org/images/male.png'},
                    {'address': '0x759605f5497c578988d167e2f66d4955d35e77af', 'name': 'Ariel', 'url': 'https://decentraland.org/images/male.png'},
                ],
            },
            {
                'name': 'DAO Committee',
                'description': "Their principal responsibility is to enact binding proposals on-chain like listing Point of Interests, sending Grants, and any other operations involving the DAO's smart contracts.",
                'members': [
                    {'address': '0xfe91C0c482E09600f2d1DBCA10FD705BC6de60bc', 'name': 'Yemel', 'url': 'https://peer.decentraland.org/content/contents/QmUvDC3wSSTg7Hnej2A6sp3KZPqSULtvkJfvMBJBrLSb8p'},
                    {'address': '0xBef99f5f55CF7cDb3a70998C57061B7e1386a9b0', 'name': 'Kyllian', 'url': 'https://decentraland.org/images/male.png'},
                ],
            },
            {
                'name': 'DAO Facilitator',
                'description': "Responsible for general community outreach and hosting monthly town halls. The DAO Facilitator writes bi-weekly reports based on the comments of the DAO Committee and the community.",
                'members': [
                    {'address': '0x76fb13f00CdbdD5eAC8E2664CF14be791aF87cb0', 'name': 'Matimio', 'avatar': 'https://peer.decentraland.org/content/contents/QmZ7NSnpi4wRdrrC5RLzCbed6wgmjgei2WarKgVDZ5tru6'},
                ],
            },
            {
                'name': 'Wearable Curation Team',
                'description': "Responsible for reviewing new wearable submissions ensuring they are glitch-free and compliant with the design guidelines. They also rise warnings about IP infringement and violent content.",
                'members': [
                    {'address': '0x8938d1f65abe7750b0777206ee26c974a6721194', 'name': 'Shibu', 'avatar': 'https://peer.decentraland.org/content/contents/Qma12zSYqq3zN6kRdVG57fE1L1ejwFaGVoWesWvJQ5nwsQ'},
                    {'address': '0x7a3891acf4f3b810992c4c6388f2e37357d7d3ab', 'name': 'JP', 'avatar': 'https://peer.decentraland.org/content/contents/QmSP9nM8bWDCWnSZry7bveufHyXAYNc7WKmkcvMdfd6vy7'},
                    {'address': '0x5d7846007c1dd6dca25d16ce2f71ec13bcdcf6f0', 'name': 'Lau', 'avatar': 'https://peer.decentraland.org/content/contents/QmPKxjopunHgfp9ezgTUdpDTNv6EWuJnvijMqixrSM7tGE'},
                    {'address': '0x716954738e57686a08902d9dd586e813490fee23', 'name': 'Hirotokai', 'avatar': 'https://peer.decentraland.org/content/contents/QmToWDDeMkpnpjZq2wQzE4JYLGSHkfL3QVQkHNk97ZsXv7'},
                    {'address': '0x82d54417fc69681dc74a6c0c68c6dbad5a2857b9', 'name': 'Malloy', 'avatar': 'https://peer.decentraland.org/content/contents/QmRUop9sik6BmusbhYHymeMwyntiZwECexPksTJNzFu5jB'},
                    {'address': '0x91e222ed7598efbcfe7190481f2fd14897e168c8', 'name': 'Chestnutbruze', 'avatar': 'https://peer.decentraland.org/content/contents/QmdAsk9UwnZZgSmcUjY1rb1WeeGRiPznmyqQCXqesHyqx7'},
                    {'address': '0x5E382071464A6F9EA29708A045983dc265B0D86d', 'name': 'Sango', 'avatar': 'https://peer.decentraland.org/content/contents/QmU4qcD3x92H5jQ8djuFE8SPYjcLXpQnVELuqhdmR5oVUy'},
                    {'address': '0xc8ad6322821b51da766a4b2a82b39fb72b53d276', 'name': 'Grimey', 'avatar': 'https://peer.decentraland.org/content/contents/QmevxQr6eBno2s5yjNpXhyTANx2gQ8xKr3JzcvkTL5DqYA'},
                    {'address': '0xa8c7d5818A255A1856b31177E5c96E1D61c83991', 'name': 'AndreusAs', 'avatar': 'https://peer.decentraland.org/content/contents/QmaX2fHvNWNbsGw4sLbaArip9HNk4QjEEdWB7N9uupm2cM'},
                    {'address': '0x336685bb3A96E13B77E909d7C52e8AfCfF1E859E', 'name': 'Mitch Todd', 'avatar': 'https://peer.decentraland.org/content/contents/QmXKhoqxauJRUQsghcXULzNBkwyEVw6DFrRhNxmVTnFy8y'},
                    {'address': '0x41eb5F82af60873b3C14fEDB898A1712f5c35366', 'name': 'Kristian', 'avatar': 'https://peer.decentraland.org/content/contents/QmTdAJJ2ccL75GUp3kdjkkUvAtqPtEkHhDqXJV57bFAf8V'},
                    {'address': '0x470c33aBD57166940095d59BD8Dd573cBae556c3', 'name': 'James Guard', 'avatar': 'https://peer.decentraland.org/content/contents/Qmc8Ff1FtvnkDYY3JCBjyZgT5okeudJPUhF89RtG62oQhV'},
                    {'address': '0x1DeC5f50cB1467F505BB3ddFD408805114406b10', 'name': 'Fabeeo Breen', 'avatar': 'https://peer.decentraland.org/content/contents/QmQAUCheYJyaj7T2Uk9rwAqVYabDxpm1AiMxGD4KgLosmu'},
                    {'address': '0x805797Df0c0d7D70E14230b72E30171d730DA55e', 'name': 'Yannakis', 'avatar': 'https://peer.decentraland.org/content/contents/QmeobCJZze79Nye5KCaUtAfZ7Z1wkE9Z7youUaDG4TzqbV'},
                ],
            }
        ]
    };

    Utils.saveToJSON('api.json', data);
}

main();
