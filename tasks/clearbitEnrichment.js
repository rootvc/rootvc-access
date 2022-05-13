require('dotenv').config();
const Prisma = require('@prisma/client');
const prisma = new Prisma.PrismaClient();
let clearbit = require('clearbit')(process.env['CLEARBIT_API_KEY']);

module.exports = async (payload, helpers) => {
  const { email } = payload;
  let record = await prisma.ClearbitEnrichment.findUnique({
    where: { email: email }
  });

  if (!record) { // if ClearbitEnrichment record doesn't exist, fetch it from API
    try {
      const res = await clearbit.Enrichment.find({ email: email, stream: true });
      record = createClearbitEnrichment(email, res, helpers);
      helpers.logger.info(`API ClearbitEnrichment: ${email}`);
    } catch (error) {
      if (error instanceof clearbit.Enrichment.NotFoundError) {
        helpers.logger.error(`NOT FOUND: API ClearbitEnrichment could not find Enrichment for: ${email}`, error);
        await prisma.ClearbitEnrichment.create({
          data: { email: email }
        });
      } else {
        helpers.logger.error(`API ClearbitEnrichment error for ${email}`, error);
      }
    }
  }
  else {
    helpers.logger.info(`CACHE HIT: ClearbitEnrichment: ${email}`);
  }

  // If record was found in either cache (db) or API
  if (record) {
    person = record.raw ? record.raw.person : null;
    company = record.raw ? record.raw.company : null;

    // enrich Person record
    if (person) {
      await upsertPerson(person, company ? company.id : null, helpers);
      helpers.logger.info(`Enriched Person: ${email}`);
    } else {
      helpers.logger.error(`ClearbitEnrichment: Person ${email} not found`);
    };

    // enrich Company record
    if (company) {
      await upsertCompany(company, helpers);
      helpers.logger.info(`Enriched Company for: ${email}`);
    } else {
      helpers.logger.error(`ClearbitEnrichment: Company for ${email} not found`);
    };
  }
};

const createClearbitEnrichment = async (email, data, helpers) => {
  const person = data.person;
  const company = data.company;

  const record = {
    email: email,
    raw: data,
  };

  if (person) {
    record.personId = person.id;
    record.personNameGivenName = person.name.givenName;
    record.personNameFamilyName = person.name.familyName;
    record.personIndexedAt = person.indexedAt;
  }

  if (company) {
    record.companyId = company.id;
    record.companyName = company.name;
    record.companyDomain = company.domain;
    record.companyIndexedAt = company.indexedAt;
  }

  try {
    return await prisma.ClearbitEnrichment.create({
      data: record
    });
  } catch (error) {
    helpers.logger.error(`Error creating ClearbitEnrichment for: ${person}`, error);
  }
};

const upsertPerson = async (person, companyId, helpers) => {
  const data = {
    "clearbitId": person.id,
    "email": person.email,
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
    "gravatarUrls": person.gravatar.urls ? person.gravatar.urls.map(a => a.value) : [],
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

  try {
    await prisma.Person.upsert({
      where: { email: person.email },
      update: data,
      create: data,
    });
  } catch (error) {
    helpers.logger.error(`Error upserting Person for: ${person.email}`, error);
  }
};

const upsertCompany = async (company, helpers) => {
  const data = {
    "clearbitId": company.id,
    "domain": company.domain,
    "description": company.description,
    "domainAliases": company.domainAliases || [],
    "emailProvider": company.emailProvider,
    "location": company.location,
    "logo": company.logo,
    "name": company.name,
    "phone": company.phone,
    "tags": company.tags || [],
    "tech": company.tech || [],
    "techCategories": company.techCategories || [],
    "ticker": company.ticker,
    "timeZone": company.timeZone,
    "type": company.type,
    "utcOffset": company.utcOffset,
    "categoryIndustry": company.category.industry,
    "categoryIndustryGroup": company.category.industryGroup,
    "categoryNaicsCode": company.category.naicsCode,
    "categorySector": company.category.sector,
    "categorySicCode": company.category.sicCode,
    "categorySubIndustry": company.category.subIndustry,
    "geoCity": company.geo.city,
    "geoCountry": company.geo.country,
    "geoCountryCode": company.geo.countryCode,
    "geoLat": company.geo.lat,
    "geoLng": company.geo.lng,
    "geoPostalCode": company.geo.postalCode,
    "geoState": company.geo.state,
    "geoStateCode": company.geo.stateCode,
    "geoStreetName": company.geo.streetName,
    "geoStreetNumber": company.geo.streetNumber,
    "geoSubPremise": company.geo.subPremise,
    "identifiersUsEin": company.identifiers.usEin,
    "metricsAlexaGlobalRank": company.metrics.alexaGlobalRank,
    "metricsAlexaUsRank": company.metrics.alexaUsRank,
    "metricsAnnualRevenue": company.metrics.annualRevenue,
    "metricsEmployees": company.metrics.employees,
    "metricsEmployeesRange": company.metrics.employeesRange,
    "metricsEstimatedAnnualRevenue": company.metrics.estimatedAnnualRevenue,
    "metricsFiscalYearEnd": company.metrics.fiscalYearEnd,
    "metricsMarketCap": company.metrics.marketCap,
    "metricsRaised": company.metrics.raised,
    "parentDomain": company.parentDomain,
    "siteEmailAddresses": company.site.emailAddresses || [],
    "sitePhoneNumbers": company.site.phoneNumbers || [],
    "ultimateParentDomain": company.ultimateParentDomain,
    "crunchbaseHandle": company.crunchbase.handle,
    "facebookHandle": company.facebook.handle,
    "facebookLikes": company.facebook.likes,
    "twitterId": String(company.twitter.id),
    "twitterHandle": company.twitter.handle,
    "twitterAvatar": company.twitter.avatar,
    "twitterBio": company.twitter.bio,
    "twitterFollowers": company.twitter.followers,
    "twitterFollowing": company.twitter.following,
    "twitterLocation": company.twitter.location,
    "twitterSite": company.twitter.site,
    "indexedAt": company.indexedAt,
  };

  try {
    await prisma.Company.upsert({
      where: { domain: company.domain },
      update: data,
      create: data,
    });
  } catch (error) {
    helpers.logger.error(`Error upserting Company for: ${company.domain}`, error);
  }
};
