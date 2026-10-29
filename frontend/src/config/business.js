/**
 * Business details shown on the website.
 *
 * Leave a value as null until the owner confirms it. The site then shows a
 * "to be announced" message instead of inventing details.
 *
 * phone:      shown as a tap-to-call link, e.g. '+91XXXXXXXXXX'
 * whatsapp:   digits only with country code, e.g. '91XXXXXXXXXX'
 * email:      optional
 */
export const business = {
  phone: null,
  whatsapp: null,
  email: null,
  // Working hours text, per language, e.g. { hi: 'सोम–शनि, सुबह 10 – शाम 6', en: 'Mon–Sat, 10 am – 6 pm' }
  hours: null,
  // Set to a path like '/images/owner.jpg' once the owner supplies a photograph.
  ownerPhoto: null,
};
