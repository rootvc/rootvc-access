require('dotenv').config();
const Prisma = require('@prisma/client');
const e = require('express');
const prisma = new Prisma.PrismaClient();
var clearbit = require('clearbit')(process.env['CLEARBIT_API_KEY']);

module.exports = async (payload, helpers) => {
    const { email } = payload;
    var record = await prisma.ClearbitEnrichment.findUnique({
        where: { email: email }
    });

    if (!record) { // if ClearbitEnrichment record doesn't exist, fetch it from API
        await clearbit.Enrichment.find({ email: email })
        .then(res => {
            _createClearbitEnrichment(email, res)
            helpers.logger.info('API ClearbitEnrichment: ' + res.person.email);
            return res;
        })
        .then(res => {
            const person = res.person
            const company = res.company;
        
            // enrich Person record
            if (person) {
                _upsertPerson(person, company.id)
                .then(res => { helpers.logger.info('Enriched Person: ' + person.email) });
            } else {
                helpers.logger.info('API ClearbitEnrichment: Person ' + person.email + ' not found');
            };
        
            // enrich Company record
            // if (company) {
            //     helpers.logger.info('ClearbitEnrichment: Company found: ' + company.name);
            //     _upsertCompany(company)
            //     .then(res => { helpers.logger.info('Enriched Company: ', + JSON.stringify(res)) });
            // } else {
            //     helpers.logger.info('API: ClearbitEnrichment: Company not found');
            // };
        })
        .catch(async (err) => { // TODO: Find the actual error Enrichment returns when NotFound
            helpers.logger.info('NOT FOUND: API ClearbitEnrichment could not find Enrichment for: ' + email);
            await prisma.ClearbitEnrichment.create({
                data: { email: email }
            })
        })
    } else {
        helpers.logger.info('CACHE HIT: ClearbitEnrichment: ' + email);
    }
};

const _createClearbitEnrichment = async (email, data) => {
    const person = data.person;
    const company = data.company;

    // TODO: Create an empty data object and merge only non-null values with it
    const record = {
        email: email,
        raw: data,
        personId: person ? person.id : null,
        personNameFullName: person ? person.name.fullName : null,
        personIndexedAt: person ? person.indexedAt : null,
        companyId: company ? company.id : null,
        companyDomain: company ? company.domain : null,
        companyName: company ? company.name : null,
        companyIndexedAt: company ? company.indexedAt : null,
    };

    await prisma.ClearbitEnrichment.create({
        data: record
    })
};

const _upsertPerson = async (person, companyId) => {
    const data = {
        "email": person.email,
        "clearbitId": person.id,
        "avatar": person.avatar,
        "bio": person.bio,
        "emailProvider": person.emailProvider,
        "location": person.location,
        "site": person.site,
        "timezone": person.timezone,
        "utcOffset": person.utcOffset,
        "nameFamilyName": person.name.familyName,
        "nameGivenName": person.name.givenName,
        "nameFullName": person.name.fullName,
        "employmentDomain": person.employment.domain,
        "employmentName": person.employment.name,
        "employmentRole": person.employment.role,
        "employmentSeniority": person.employment.seniority,
        "employmentSubRole": person.employment.subRole,
        "employmentTitle": person.employment.title,
        "geoCity": person.geo.city,
        "geoCountry": person.geo.country,
        "geoCountryCode": person.geo.countryCode,
        "geoLat": person.geo.lat,
        "geoLng": person.geo.lng,
        "geoState": person.geo.state,
        "geoStateCode": person.geo.stateCode,
        "facebookHandle": person.facebook.handle,
        "githubId": String(person.github.id),
        "githubHandle": person.github.handle,
        "githubAvatar": person.github.avatar,
        "githubBlog": person.github.blog,
        "githubCompany": person.github.company,
        "githubFollowers": person.github.followers,
        "githubFollowing": person.github.following,
        "googleplusHandle": person.googleplus.handle,
        "gravatarHandle": person.gravatar.handle,
        "gravatarAvatar": person.gravatar.avatar,
        "gravatarAvatars": person.gravatar.avatars ? person.gravatar.avatars.map(a => a.url) : [],
        "gravatarUrls": person.gravatar.urls || [],
        "linkedinHandle": person.linkedin.handle,
        "twitterId": String(person.twitter.id),
        "twitterHandle": person.twitter.handle,
        "twitterAvatar": person.twitter.avatar,
        "twitterBio": person.twitter.bio,
        "twitterFavorites": person.twitter.favorites,
        "twitterFollowers": person.twitter.followers,
        "twitterFollowing": person.twitter.following,
        "twitterLocation": person.twitter.location,
        "twitterSite": person.twitter.site,
        "twitterStatuses": person.twitter.statuses,
        "companyId": companyId,
        "indexedAt": person.indexedAt,
    };

    await prisma.Person.upsert({
        where: { email: person.email },
        update: data,
        create: data,
    });
};

const _upsertCompany = async (data) => {
    await prisma.Company.upsert({
      where: { domain: data.domain },
      update: data,
      create: data,
    });
};
