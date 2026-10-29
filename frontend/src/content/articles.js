/**
 * Educational articles.
 *
 * Each article has Hindi and English text written as simple blocks:
 *   { type: 'p', text }            paragraph
 *   { type: 'h2', text }           section heading
 *   { type: 'ul' | 'ol', items }   bulleted / numbered list
 *   { type: 'note', text }         highlighted note
 *
 * IMPORTANT before publishing:
 *   - The consultant must read and confirm every article. When he has, set
 *     `ownerReviewed: true` and update `lastReviewed` to that date.
 *   - Check that each link in `sources` still opens the official page.
 *   - Do not add fees, deadlines or legal rules unless they are confirmed
 *     from an official source, and link that source.
 */

const OFFICIAL = {
  biharBhumi: {
    url: 'https://biharbhumi.bihar.gov.in/',
    label: {
      hi: 'बिहार भूमि पोर्टल (राजस्व एवं भूमि सुधार विभाग)',
      en: 'Bihar Bhumi portal (Revenue and Land Reforms Department)',
    },
  },
  parimarjan: {
    url: 'https://parimarjan.bihar.gov.in/',
    label: {
      hi: 'परिमार्जन पोर्टल – डिजिटाइज्ड जमाबंदी में सुधार',
      en: 'Parimarjan portal – corrections to the digitised Jamabandi',
    },
  },
  department: {
    url: 'https://state.bihar.gov.in/lrc/',
    label: {
      hi: 'राजस्व एवं भूमि सुधार विभाग, बिहार सरकार',
      en: 'Revenue and Land Reforms Department, Government of Bihar',
    },
  },
};

export const articles = [
  {
    slug: 'jamabandi-name-discrepancies',
    lastReviewed: '2026-10-29',
    ownerReviewed: false,
    sources: [OFFICIAL.biharBhumi, OFFICIAL.parimarjan],
    hi: {
      title: 'बिहार जमाबंदी में नाम की गड़बड़ी: क्या-क्या जाँचें',
      description:
        'जमाबंदी में नाम, पिता का नाम या रकबा गलत दिखे तो घबराएँ नहीं। पहले ये बातें जाँचें और सही दस्तावेज़ जुटाएँ।',
      body: [
        {
          type: 'p',
          text: 'जमाबंदी अंचल कार्यालय में रखा जाने वाला राजस्व रजिस्टर है, जिसमें दर्ज होता है कि किस जमीन का लगान कौन देता है। बिहार में यह रजिस्टर ऑनलाइन भी देखा जा सकता है। कई परिवारों को ऑनलाइन जमाबंदी में अपना या अपने पूर्वजों का नाम अलग वर्तनी में, अधूरा या गलत दिखता है।',
        },
        { type: 'h2', text: 'आम तौर पर दिखने वाली गड़बड़ियाँ' },
        {
          type: 'ul',
          items: [
            'रैयत या पिता के नाम की वर्तनी केवाला, खतियान या लगान रसीद से अलग होना।',
            'जमीन किसी ऐसे पूर्वज के नाम पर दर्ज रहना जिनका देहांत हो चुका है।',
            'खाता, खेसरा या रकबा (क्षेत्रफल) का गलत या अधूरा दर्ज होना।',
            'डिजिटाइज्ड (ऑनलाइन) जमाबंदी में कोई प्रविष्टि दिखाई ही न देना।',
          ],
        },
        { type: 'h2', text: 'क्रम से क्या जाँचें' },
        {
          type: 'ol',
          items: [
            'बिहार भूमि पोर्टल पर अपनी जमाबंदी देखें और जमाबंदी संख्या, भाग/पृष्ठ, खाता, खेसरा और रकबा नोट करें।',
            'इन्हें अपने मूल दस्तावेज़ों से मिलाएँ: रजिस्टर्ड केवाला (विक्रय-पत्र) या बँटवारा-पत्र, सर्वे खतियान और पुरानी लगान रसीदें।',
            'समझें कि गलती कहाँ है: क्या ऑनलाइन प्रति पुराने हस्तलिखित रजिस्टर से मेल नहीं खाती, या मूल अभिलेख में ही गलती है?',
            'डिजिटाइज्ड जमाबंदी की गलतियों के सुधार के लिए विभाग ने परिमार्जन पोर्टल बनाया है। आवेदन से पहले वहाँ की वर्तमान प्रक्रिया और माँगे गए दस्तावेज़ ज़रूर पढ़ें।',
            'अगर मालिक बदल गया है (जैसे खरीद या उत्तराधिकार), तो यह सुधार नहीं बल्कि दाखिल-खारिज (म्यूटेशन) का मामला हो सकता है।',
            'हर आवेदन की संख्या, तारीख और रसीद संभाल कर रखें।',
          ],
        },
        { type: 'h2', text: 'कब किसी विशेषज्ञ से मिलें' },
        {
          type: 'p',
          text: 'अगर जमीन पर स्वामित्व का विवाद है, कोई और दावा कर रहा है, या मामला अदालत में है, तो किसी अधिवक्ता से सलाह लें। जमाबंदी एक राजस्व अभिलेख है; स्वामित्व के विवाद सक्षम न्यायालय या प्राधिकारी तय करते हैं।',
        },
        {
          type: 'note',
          text: 'पोर्टल की सुविधाएँ और प्रक्रियाएँ समय-समय पर बदलती रहती हैं। आवेदन से पहले आधिकारिक पोर्टल या अपने अंचल कार्यालय से वर्तमान नियम ज़रूर पुष्टि करें।',
        },
      ],
    },
    en: {
      title: 'Bihar Jamabandi name discrepancies: what to check',
      description:
        'If a name, father’s name or area looks wrong in your Jamabandi, check these points first and gather the right documents.',
      body: [
        {
          type: 'p',
          text: 'The Jamabandi is a revenue register kept at the circle (anchal) office. It records who pays land rent (lagan) for which land, and in Bihar it can also be viewed online. Many families find their own or an ancestor’s name in the online Jamabandi spelled differently, incomplete or wrong.',
        },
        { type: 'h2', text: 'Common discrepancies' },
        {
          type: 'ul',
          items: [
            'The raiyat’s or father’s name is spelled differently from the sale deed, khatiyan or rent receipt.',
            'The land is still recorded in the name of an ancestor who has died.',
            'Khata, khesra or area is recorded wrongly or incompletely.',
            'An entry does not appear at all in the digitised (online) Jamabandi.',
          ],
        },
        { type: 'h2', text: 'What to check, step by step' },
        {
          type: 'ol',
          items: [
            'View your Jamabandi on the Bihar Bhumi portal and note the Jamabandi number, volume/page, khata, khesra and area.',
            'Compare these with your original documents: registered sale or partition deed, survey khatiyan and old rent receipts.',
            'Work out where the error is: does the online copy differ from the old handwritten register, or is the underlying record itself wrong?',
            'For errors in the digitised Jamabandi, the department provides the Parimarjan portal. Read its current procedure and document list before applying.',
            'If ownership has changed (for example by purchase or inheritance), this may be a mutation (dakhil-kharij) matter rather than a correction.',
            'Keep the number, date and receipt of every application you make.',
          ],
        },
        { type: 'h2', text: 'When to see a specialist' },
        {
          type: 'p',
          text: 'If ownership is disputed, someone else is making a claim, or the matter is in court, consult an advocate. The Jamabandi is a revenue record; ownership disputes are decided by a competent court or authority.',
        },
        {
          type: 'note',
          text: 'Portal features and procedures change from time to time. Before applying, confirm the current rules on the official portal or at your circle office.',
        },
      ],
    },
  },
  {
    slug: 'mutation-application-rejected',
    lastReviewed: '2026-10-29',
    ownerReviewed: false,
    sources: [OFFICIAL.biharBhumi, OFFICIAL.department],
    hi: {
      title: 'दाखिल-खारिज (म्यूटेशन) आवेदन अस्वीकृत हो जाए तो क्या करें',
      description:
        'म्यूटेशन आवेदन रद्द होने पर सबसे पहले आदेश में लिखा कारण समझें, फिर तय करें कि दोबारा आवेदन करना है या अपील।',
      body: [
        {
          type: 'p',
          text: 'दाखिल-खारिज या म्यूटेशन का अर्थ है खरीद, दान, उत्तराधिकार या बँटवारे जैसे हस्तांतरण के बाद राजस्व अभिलेख (जमाबंदी) में नए व्यक्ति का नाम दर्ज कराना। बिहार में इसका आवेदन ऑनलाइन किया जाता है और अंचल अधिकारी जाँच रिपोर्ट के आधार पर निर्णय लेते हैं।',
        },
        { type: 'h2', text: 'पहला कदम: अस्वीकृति का आदेश पढ़ें' },
        {
          type: 'p',
          text: 'आदेश की प्रति डाउनलोड करें या प्राप्त करें और उसमें लिखा कारण ध्यान से पढ़ें। आम कारण हो सकते हैं:',
        },
        {
          type: 'ul',
          items: [
            'ज़रूरी दस्तावेज़ संलग्न न होना या पढ़ने लायक न होना।',
            'केवाला और जमाबंदी में खाता, खेसरा या रकबा का मेल न खाना।',
            'किसी अन्य व्यक्ति द्वारा आपत्ति दर्ज करना।',
            'उत्तराधिकार के मामलों में परिवार के सभी हिस्सेदारों की जानकारी पूरी न होना।',
          ],
        },
        { type: 'h2', text: 'आगे के विकल्प' },
        {
          type: 'ol',
          items: [
            'अगर कमी दूर की जा सकती है (जैसे कोई दस्तावेज़ छूट गया), तो कमी पूरी कर के नया आवेदन करना संभव हो सकता है।',
            'अंचल अधिकारी के म्यूटेशन आदेश के विरुद्ध कानून में अपील का प्रावधान है, जो सामान्यतः भूमि सुधार उप समाहर्ता (DCLR) के यहाँ होती है। अपील की समय-सीमा होती है, इसलिए आदेश मिलते ही वर्तमान नियम और समय-सीमा की पुष्टि करें।',
            'अगर मामले में स्वामित्व का विवाद है, तो किसी अधिवक्ता से सलाह लें।',
          ],
        },
        { type: 'h2', text: 'दस्तावेज़ जो प्रायः काम आते हैं' },
        {
          type: 'ul',
          items: [
            'रजिस्टर्ड केवाला, दान-पत्र या बँटवारा-पत्र की प्रति।',
            'पिछली जमाबंदी की प्रति और लगान रसीद।',
            'सर्वे खतियान की प्रति।',
            'उत्तराधिकार के मामले में मृत्यु प्रमाण-पत्र और वंशावली, यदि माँगी जाए।',
          ],
        },
        {
          type: 'note',
          text: 'किसी भी व्यक्ति को अनौपचारिक भुगतान न करें और "पक्का काम" कराने का वादा करने वालों से सावधान रहें। सरकारी शुल्क और प्रक्रिया केवल आधिकारिक स्रोत से पुष्टि करें।',
        },
      ],
    },
    en: {
      title: 'What to do when a mutation application is rejected',
      description:
        'When a mutation (dakhil-kharij) application is rejected, first understand the reason in the order, then decide whether to reapply or appeal.',
      body: [
        {
          type: 'p',
          text: 'Mutation, or dakhil-kharij, means recording a new person’s name in the revenue record (Jamabandi) after a transfer such as a sale, gift, inheritance or partition. In Bihar the application is made online, and the Circle Officer decides it on the basis of a field enquiry report.',
        },
        { type: 'h2', text: 'First step: read the rejection order' },
        {
          type: 'p',
          text: 'Download or obtain a copy of the order and read the stated reason carefully. Common reasons can include:',
        },
        {
          type: 'ul',
          items: [
            'Required documents were not attached or were not legible.',
            'Khata, khesra or area in the deed does not match the Jamabandi.',
            'Another person filed an objection.',
            'In inheritance cases, details of all family shareholders were incomplete.',
          ],
        },
        { type: 'h2', text: 'Your options' },
        {
          type: 'ol',
          items: [
            'If the problem can be fixed (for example a missing document), it may be possible to correct it and apply again.',
            'The law provides an appeal against a Circle Officer’s mutation order, usually before the Deputy Collector Land Reforms (DCLR). Appeals have time limits, so confirm the current rules and deadline as soon as you receive the order.',
            'If ownership itself is disputed, consult an advocate.',
          ],
        },
        { type: 'h2', text: 'Documents that are often useful' },
        {
          type: 'ul',
          items: [
            'Copy of the registered sale, gift or partition deed.',
            'Copy of the previous Jamabandi and rent receipt.',
            'Copy of the survey khatiyan.',
            'In inheritance cases, death certificate and family tree (vanshavali) if requested.',
          ],
        },
        {
          type: 'note',
          text: 'Do not make unofficial payments, and be careful of anyone promising a guaranteed result. Confirm government fees and procedures only from official sources.',
        },
      ],
    },
  },
  {
    slug: 'khata-khesra-jamabandi-difference',
    lastReviewed: '2026-10-29',
    ownerReviewed: false,
    sources: [OFFICIAL.biharBhumi, OFFICIAL.department],
    hi: {
      title: 'खाता, खेसरा और जमाबंदी में क्या अंतर है',
      description:
        'खाता संख्या, खेसरा संख्या और जमाबंदी संख्या अलग-अलग अभिलेखों से आती हैं। सरल भाषा में समझें कि कौन-सा नंबर क्या बताता है।',
      body: [
        {
          type: 'p',
          text: 'जमीन के कागजों में कई तरह के नंबर होते हैं और लोग अक्सर इन्हें आपस में मिला देते हैं। हर नंबर एक अलग अभिलेख से जुड़ा होता है।',
        },
        { type: 'h2', text: 'खेसरा (प्लॉट संख्या)' },
        {
          type: 'p',
          text: 'खेसरा किसी राजस्व गाँव (मौजा) के सर्वे नक्शे पर एक विशेष भूखंड की संख्या है। मौजा की पहचान प्रायः थाना संख्या से होती है, इसलिए खेसरा के साथ मौजा और थाना संख्या भी देखनी चाहिए।',
        },
        { type: 'h2', text: 'खाता (खतियान की खाता संख्या)' },
        {
          type: 'p',
          text: 'सर्वे के समय बना अधिकार-अभिलेख खतियान कहलाता है। उसमें एक ही व्यक्ति या परिवार के नाम के कई भूखंडों को एक खाता संख्या के अंतर्गत रखा जाता है। यानी एक खाते में कई खेसरा हो सकते हैं।',
        },
        { type: 'h2', text: 'जमाबंदी' },
        {
          type: 'p',
          text: 'जमाबंदी अंचल कार्यालय का राजस्व रजिस्टर है, जिसमें लगान देने वाले रैयत का नाम और उसकी जमीन का विवरण दर्ज होता है। इसकी अपनी जमाबंदी संख्या होती है और दाखिल-खारिज के बाद इसमें नाम बदला जाता है।',
        },
        { type: 'h2', text: 'नंबर मेल क्यों नहीं खाते' },
        {
          type: 'ul',
          items: [
            'पुराने और नए सर्वे में खाता व खेसरा संख्या बदल सकती है।',
            'बँटवारे या बिक्री के बाद एक भूखंड कई हिस्सों में बँट सकता है।',
            'पुराने हस्तलिखित अभिलेख को ऑनलाइन करते समय त्रुटि हो सकती है।',
          ],
        },
        {
          type: 'note',
          text: 'किसी भी कागज़ पर काम शुरू करने से पहले मौजा, थाना संख्या, खाता, खेसरा, रकबा और जमाबंदी संख्या एक जगह लिख लें। इससे अंचल कार्यालय, अमीन या अधिवक्ता से बात करना आसान हो जाता है।',
        },
      ],
    },
    en: {
      title: 'The difference between Khata, Khesra and Jamabandi',
      description:
        'Khata, khesra and Jamabandi numbers come from different records. A plain-language guide to what each number tells you.',
      body: [
        {
          type: 'p',
          text: 'Land papers carry several kinds of numbers, and people often mix them up. Each number belongs to a different record.',
        },
        { type: 'h2', text: 'Khesra (plot number)' },
        {
          type: 'p',
          text: 'A khesra is the number of a particular plot on the survey map of a revenue village (mauza). A mauza is usually identified by its thana number, so always read the khesra together with the mauza and thana number.',
        },
        { type: 'h2', text: 'Khata (account number in the khatiyan)' },
        {
          type: 'p',
          text: 'The record of rights prepared during a survey is called the khatiyan. In it, plots held by the same person or family are grouped under one khata number. So one khata can contain several khesras.',
        },
        { type: 'h2', text: 'Jamabandi' },
        {
          type: 'p',
          text: 'The Jamabandi is the circle office’s revenue register. It records the name of the raiyat who pays land rent and the details of that land. It has its own Jamabandi number, and the name in it is changed through mutation (dakhil-kharij).',
        },
        { type: 'h2', text: 'Why the numbers may not match' },
        {
          type: 'ul',
          items: [
            'Khata and khesra numbers can change between an older and a newer survey.',
            'After partition or sale, one plot can be split into several parts.',
            'Errors can creep in when old handwritten records are put online.',
          ],
        },
        {
          type: 'note',
          text: 'Before starting work on any paper, write down the mauza, thana number, khata, khesra, area and Jamabandi number in one place. It makes talking to the circle office, an amin or an advocate much easier.',
        },
      ],
    },
  },
];

export function getArticle(slug) {
  return articles.find((a) => a.slug === slug) ?? null;
}
