/**
 * Services and proposed fees.
 *
 * To change a price, edit `fee` here. To change wording, edit the matching
 * "services.items.<id>" entries in locales/hi.json and locales/en.json.
 * `fee: null` shows "quote after scope assessment".
 *
 * These are proposed starting prices for testing, not verified market rates.
 * The `id` values must match ServiceType in backend/enquiries/choices.py.
 */
export const services = [
  { id: 'consultation', fee: 199 },
  { id: 'jamabandi', fee: 599 },
  { id: 'mutation', fee: 799 },
  { id: 'discrepancy', fee: 1499 },
  { id: 'survey', fee: null },
];

// Extra choice offered in the enquiry form only.
export const serviceTypeOptions = [...services.map((s) => s.id), 'other'];
