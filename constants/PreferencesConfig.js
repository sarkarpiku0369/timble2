const gender = [
    {level: 'Men', fieldValue: "Men", checkStatus: false},
    {level: 'Women', fieldValue: "Women", checkStatus: false},
    {level: 'Non-Binary', fieldValue: "nonBinary", checkStatus: false},
    {level: 'Transgender', fieldValue: "Transgender", checkStatus: false},
    {level: 'Others', fieldValue: "Others", checkStatus: false},
];

const bodyType = [
    {level: 'Slim', fieldValue: "Slim", checkStatus: false},
    {level: 'Athletic', fieldValue: "Athletic", checkStatus: false},
    {level: 'Average', fieldValue: "Average", checkStatus: false},
    {level: 'Curvy', fieldValue: "Curvy", checkStatus: false},
    {level: 'Muscular', fieldValue: "Muscular", checkStatus: false},
    {level: 'Plus-size', fieldValue: "plussize", checkStatus: false},
];

const relationship = [
    { label: 'Long term', value: 'logn-term' },
    { label: 'Short term', value: 'short-term' }
]

const sexuality = [
    { label: 'Heterosexual', value: 'Heterosexual' },
    { label: 'Homosexual', value: 'Homosexual' },
    { label: 'Bisexual', value: 'Bisexual' },
    { label: 'Pansexual', value: 'Pansexual' },
    { label: 'Asexual', value: 'Asexual' },
    { label: 'Demisexual', value: 'Demisexual' },
    { label: 'Queer', value: 'Queer' },
]

const YOUR_MATCH = {
    gender,
    bodyType,
    
}


export{
    YOUR_MATCH,
    relationship,
    sexuality
}