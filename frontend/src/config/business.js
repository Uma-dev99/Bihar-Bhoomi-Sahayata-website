/**
 * Business details shown on the website.
 *
 * A value left as null is simply not shown, so nothing is invented. The owner
 * has chosen not to publish a phone number: visitors use the enquiry form.
 * A phone number set here also appears in the search-engine data (seo/structuredData.js).
 *
 * phone:      shown as a tap-to-call link, e.g. '+91XXXXXXXXXX'
 * whatsapp:   digits only with country code, e.g. '91XXXXXXXXXX'
 * email:      optional
 */
export const business = {
  // Must match "contact.locationValue" in locales/hi.json and locales/en.json.
  address: {
    street: 'H.No 88, AP Colony, Near Hanuman Mandir',
    city: 'Gaya',
    region: 'Bihar',
    pincode: '823001',
    country: 'IN',
  },
  // What Google Maps searches for in the map on the contact page. Google does not
  // recognise the full house address, so this pins the colony. For a pin on the
  // house itself, use its coordinates from Google Maps, e.g. '24.78XXXX,84.98XXXX'.
  mapQuery: 'A P Colony, Gaya, Bihar 823001',
  phone: null,
  whatsapp: null,
  email: null,
  // Working hours text, per language.
  hours: { hi: 'सुबह 9 – शाम 6 बजे', en: '9 am – 6 pm' },
  // Set to a path like '/images/owner.jpg' once the owner supplies a photograph.
  ownerPhoto: null,
};
