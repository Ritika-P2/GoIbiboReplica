// Reusable analytics service — logs events to the console in development.
// Swap the console.log calls with a real analytics SDK (e.g. Mixpanel, Segment)
// when integrating a production analytics provider.

const isDev = import.meta.env.DEV

function track(event, properties = {}) {
  if (isDev) {
    console.log(`[Analytics] ${event}`, properties)
  }
  // TODO: forward to real analytics provider
}

export const analytics = {
  offerViewed:  (offer) => track('Offer Viewed',   { offerId: offer.id, title: offer.title, category: offer.category }),
  offerClicked: (offer) => track('Offer Clicked',  { offerId: offer.id, title: offer.title, category: offer.category }),
  offerApplied: (offer) => track('Offer Applied',  { offerId: offer.id, offerCode: offer.offerCode, category: offer.category }),
}
