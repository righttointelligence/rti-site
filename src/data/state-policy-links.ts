export type StatePolicyLink = {
  label: string;
  url: string;
  note: string;
};

export type StatePolicyLinks = {
  legislature: StatePolicyLink;
  billSearch: StatePolicyLink;
  legislatorLookup: StatePolicyLink;
  calendar?: StatePolicyLink;
};

export const STATE_POLICY_LINKS: Record<string, StatePolicyLinks> = {
  AL: {
    legislature: {
      label: "Alabama Legislature",
      url: "https://www.legislature.state.al.us/",
      note: "Official Alabama legislative portal.",
    },
    billSearch: {
      label: "Search Alabama bills",
      url: "https://alison.legislature.state.al.us/bill-search",
      note: "Official Alabama bill search.",
    },
    legislatorLookup: {
      label: "Find Alabama legislators",
      url: "https://www.legislature.state.al.us/legislators",
      note: "Official Alabama legislator directory.",
    },
  },
  AK: {
    legislature: {
      label: "Alaska Legislature",
      url: "https://www.akleg.gov/",
      note: "Official Alaska legislative portal.",
    },
    billSearch: {
      label: "Search Alaska bills and laws",
      url: "https://www.akleg.gov/basis/Home/BillsandLaws",
      note: "Official Alaska BASIS bills and laws page.",
    },
    legislatorLookup: {
      label: "Find Alaska legislators",
      url: "https://www.akleg.gov/",
      note: "Official Alaska legislative portal; use legislator navigation for district offices.",
    },
    calendar: {
      label: "Alaska committees",
      url: "https://www.akleg.gov/basis/Committee/List",
      note: "Official Alaska committee list.",
    },
  },
  AZ: {
    legislature: {
      label: "Arizona Legislature",
      url: "https://www.azleg.gov/",
      note: "Official Arizona legislative portal.",
    },
    billSearch: {
      label: "Search Arizona bills",
      url: "https://www.azleg.gov/bills/",
      note: "Official Arizona bills page.",
    },
    legislatorLookup: {
      label: "Find Arizona legislators",
      url: "https://www.azleg.gov/findmylegislator/",
      note: "Official Arizona legislator lookup.",
    },
    calendar: {
      label: "Arizona Legislature",
      url: "https://www.azleg.gov/",
      note: "Official Arizona legislative portal; use committee navigation for hearings.",
    },
  },
  AR: {
    legislature: {
      label: "Arkansas Legislature",
      url: "https://arkleg.state.ar.us/",
      note: "Official Arkansas legislative portal.",
    },
    billSearch: {
      label: "Search Arkansas bills",
      url: "https://arkleg.state.ar.us/Bills/Search",
      note: "Official Arkansas bill search.",
    },
    legislatorLookup: {
      label: "Find Arkansas legislators",
      url: "https://arkleg.state.ar.us/Legislators/List",
      note: "Official Arkansas legislator list.",
    },
    calendar: {
      label: "Arkansas committees",
      url: "https://arkleg.state.ar.us/Committees/List",
      note: "Official Arkansas committee pages.",
    },
  },
  CA: {
    legislature: {
      label: "California Legislative Information",
      url: "https://leginfo.legislature.ca.gov/",
      note: "Official California legislative information portal.",
    },
    billSearch: {
      label: "Search California bills",
      url: "https://leginfo.legislature.ca.gov/faces/billSearchClient.xhtml",
      note: "Official California bill search.",
    },
    legislatorLookup: {
      label: "Find California representatives",
      url: "https://findyourrep.legislature.ca.gov/",
      note: "Official California legislator lookup.",
    },
    calendar: {
      label: "California Assembly events",
      url: "https://www.assembly.ca.gov/schedules-publications/todays-events",
      note: "Official Assembly hearing and event page.",
    },
  },
  CO: {
    legislature: {
      label: "Colorado General Assembly",
      url: "https://leg.colorado.gov/",
      note: "Official Colorado legislative portal.",
    },
    billSearch: {
      label: "Search Colorado bills",
      url: "https://leg.colorado.gov/bill-search",
      note: "Official Colorado bill search.",
    },
    legislatorLookup: {
      label: "Find Colorado legislators",
      url: "https://leg.colorado.gov/find-my-legislator",
      note: "Official Colorado legislator lookup.",
    },
    calendar: {
      label: "Colorado committees",
      url: "https://leg.colorado.gov/content/committees",
      note: "Official Colorado committee directory.",
    },
  },
  CT: {
    legislature: {
      label: "Connecticut General Assembly",
      url: "https://www.cga.ct.gov/",
      note: "Official Connecticut legislative portal.",
    },
    billSearch: {
      label: "Search Connecticut bills",
      url: "https://www.cga.ct.gov/asp/menu/cgabillstatus.asp",
      note: "Official Connecticut bill status search.",
    },
    legislatorLookup: {
      label: "Find Connecticut legislators",
      url: "https://www.cga.ct.gov/asp/menu/cgafindleg.asp",
      note: "Official Connecticut legislator lookup.",
    },
    calendar: {
      label: "Connecticut legislative calendar",
      url: "https://www.cga.ct.gov/asp/menu/CGACalendar.asp",
      note: "Official Connecticut calendar page.",
    },
  },
  DE: {
    legislature: {
      label: "Delaware General Assembly",
      url: "https://legis.delaware.gov/",
      note: "Official Delaware legislative portal.",
    },
    billSearch: {
      label: "Search Delaware bills",
      url: "https://legis.delaware.gov/Legislation",
      note: "Official Delaware legislation page.",
    },
    legislatorLookup: {
      label: "Find Delaware legislators",
      url: "https://legis.delaware.gov/FindMyLegislator",
      note: "Official Delaware legislator lookup.",
    },
    calendar: {
      label: "Delaware committee meetings",
      url: "https://legis.delaware.gov/CommitteeMeetings",
      note: "Official Delaware committee meeting page.",
    },
  },
  FL: {
    legislature: {
      label: "Florida Legislature",
      url: "https://www.leg.state.fl.us/",
      note: "Official Florida legislative portal.",
    },
    billSearch: {
      label: "Search Florida bills",
      url: "https://www.flsenate.gov/Session/Bills",
      note: "Official Florida Senate bill search.",
    },
    legislatorLookup: {
      label: "Find Florida senators",
      url: "https://www.flsenate.gov/Senators/Find",
      note: "Official Florida Senate legislator lookup.",
    },
    calendar: {
      label: "Florida committee schedules",
      url: "https://www.myfloridahouse.gov/Sections/Committees/committeeschedules.aspx",
      note: "Official Florida House committee schedule page.",
    },
  },
  GA: {
    legislature: {
      label: "Georgia General Assembly",
      url: "https://www.legis.ga.gov/",
      note: "Official Georgia legislative portal.",
    },
    billSearch: {
      label: "Search Georgia legislation",
      url: "https://www.legis.ga.gov/legislation/all",
      note: "Official Georgia legislation search.",
    },
    legislatorLookup: {
      label: "Find Georgia legislators",
      url: "https://www.legis.ga.gov/members/find-your-legislator",
      note: "Official Georgia legislator lookup.",
    },
    calendar: {
      label: "Georgia schedule",
      url: "https://www.legis.ga.gov/schedule/all",
      note: "Official Georgia legislative schedule.",
    },
  },
  HI: {
    legislature: {
      label: "Hawaii State Legislature",
      url: "https://www.capitol.hawaii.gov/",
      note: "Official Hawaii legislative portal.",
    },
    billSearch: {
      label: "Search Hawaii bills",
      url: "https://www.capitol.hawaii.gov/legislature/bills.aspx",
      note: "Official Hawaii bill search.",
    },
    legislatorLookup: {
      label: "Find Hawaii legislators",
      url: "https://www.capitol.hawaii.gov/fyl/",
      note: "Official Hawaii legislator lookup.",
    },
    calendar: {
      label: "Hawaii calendar",
      url: "https://www.capitol.hawaii.gov/legislature/calendar.aspx",
      note: "Official Hawaii legislative calendar.",
    },
  },
  ID: {
    legislature: {
      label: "Idaho Legislature",
      url: "https://legislature.idaho.gov/",
      note: "Official Idaho legislative portal.",
    },
    billSearch: {
      label: "Search Idaho legislation",
      url: "https://legislature.idaho.gov/sessioninfo/2026/legislation/",
      note: "Official Idaho session legislation page.",
    },
    legislatorLookup: {
      label: "Find Idaho legislators",
      url: "https://legislature.idaho.gov/legislators/whosmylegislator/",
      note: "Official Idaho legislator lookup.",
    },
    calendar: {
      label: "Idaho session information",
      url: "https://legislature.idaho.gov/sessioninfo/",
      note: "Official Idaho session and committee information.",
    },
  },
  IL: {
    legislature: {
      label: "Illinois General Assembly",
      url: "https://www.ilga.gov/",
      note: "Official Illinois legislative portal.",
    },
    billSearch: {
      label: "Search Illinois legislation",
      url: "https://www.ilga.gov/legislation/",
      note: "Official Illinois legislation page.",
    },
    legislatorLookup: {
      label: "Find Illinois districts",
      url: "https://www.elections.il.gov/ElectionOperations/DistrictLocator/AddressFinder.aspx",
      note: "Official Illinois State Board of Elections district lookup.",
    },
  },
  IN: {
    legislature: {
      label: "Indiana General Assembly",
      url: "https://iga.in.gov/",
      note: "Official Indiana legislative portal.",
    },
    billSearch: {
      label: "Search Indiana bills",
      url: "https://iga.in.gov/legislative/2026/bills/",
      note: "Official Indiana bill page.",
    },
    legislatorLookup: {
      label: "Find Indiana legislators",
      url: "https://iga.in.gov/information/find-legislators",
      note: "Official Indiana legislator lookup.",
    },
    calendar: {
      label: "Indiana committees",
      url: "https://iga.in.gov/legislative/2026/committees/",
      note: "Official Indiana committee pages.",
    },
  },
  IA: {
    legislature: {
      label: "Iowa Legislature",
      url: "https://www.legis.iowa.gov/",
      note: "Official Iowa legislative portal.",
    },
    billSearch: {
      label: "Search Iowa legislation",
      url: "https://www.legis.iowa.gov/legislation",
      note: "Official Iowa legislation page.",
    },
    legislatorLookup: {
      label: "Find Iowa legislators",
      url: "https://www.legis.iowa.gov/legislators/find",
      note: "Official Iowa legislator lookup.",
    },
    calendar: {
      label: "Iowa committees",
      url: "https://www.legis.iowa.gov/committees",
      note: "Official Iowa committee pages.",
    },
  },
  KS: {
    legislature: {
      label: "Kansas Legislature",
      url: "https://www.kslegislature.gov/",
      note: "Official Kansas legislative portal.",
    },
    billSearch: {
      label: "Search Kansas legislation",
      url: "https://www.kslegislature.gov/",
      note: "Official Kansas legislative portal; use its bills and measures navigation for current bill status.",
    },
    legislatorLookup: {
      label: "Find Kansas legislators",
      url: "https://www.kslegislature.gov/",
      note: "Official Kansas legislative portal; use member navigation for legislator contacts.",
    },
  },
  KY: {
    legislature: {
      label: "Kentucky General Assembly",
      url: "https://legislature.ky.gov/",
      note: "Official Kentucky legislative portal.",
    },
    billSearch: {
      label: "Search Kentucky bills",
      url: "https://apps.legislature.ky.gov/record/26rs/record.html",
      note: "Official Kentucky session record.",
    },
    legislatorLookup: {
      label: "Find Kentucky legislators",
      url: "https://apps.legislature.ky.gov/findyourlegislator/findyourlegislator.html",
      note: "Official Kentucky legislator lookup.",
    },
    calendar: {
      label: "Kentucky legislative calendar",
      url: "https://apps.legislature.ky.gov/LegislativeCalendar/",
      note: "Official Kentucky legislative calendar.",
    },
  },
  LA: {
    legislature: {
      label: "Louisiana Legislature",
      url: "https://legis.la.gov/",
      note: "Official Louisiana legislative portal.",
    },
    billSearch: {
      label: "Search Louisiana bills",
      url: "https://www.legis.la.gov/legis/BillSearch.aspx",
      note: "Official Louisiana bill search.",
    },
    legislatorLookup: {
      label: "Find Louisiana legislators",
      url: "https://www.legis.la.gov/legis/FindMyLegislators.aspx",
      note: "Official Louisiana legislator lookup.",
    },
    calendar: {
      label: "Louisiana agendas",
      url: "https://www.legis.la.gov/legis/agenda.aspx",
      note: "Official Louisiana agenda page.",
    },
  },
  ME: {
    legislature: {
      label: "Maine Legislature",
      url: "https://legislature.maine.gov/",
      note: "Official Maine legislative portal.",
    },
    billSearch: {
      label: "Search Maine legislation",
      url: "https://legislature.maine.gov/LawMakerWeb/search.asp",
      note: "Official Maine legislation search.",
    },
    legislatorLookup: {
      label: "Find Maine legislators",
      url: "https://legislature.maine.gov/house/house/MemberProfiles/ListAlphaTown",
      note: "Official Maine town-by-town legislator list.",
    },
    calendar: {
      label: "Maine legislative calendar",
      url: "https://legislature.maine.gov/Calendar/",
      note: "Official Maine legislative calendar.",
    },
  },
  MD: {
    legislature: {
      label: "Maryland General Assembly",
      url: "https://mgaleg.maryland.gov/",
      note: "Official Maryland legislative portal.",
    },
    billSearch: {
      label: "Search Maryland legislation",
      url: "https://mgaleg.maryland.gov/mgawebsite/Legislation/Charts",
      note: "Official Maryland legislation chart.",
    },
    legislatorLookup: {
      label: "Find Maryland legislators",
      url: "https://mgaleg.maryland.gov/mgawebsite/Members/District",
      note: "Official Maryland member-by-district page.",
    },
    calendar: {
      label: "Maryland committee meetings",
      url: "https://mgaleg.maryland.gov/mgawebsite/Committees/Meetings",
      note: "Official Maryland committee meeting page.",
    },
  },
  MA: {
    legislature: {
      label: "Massachusetts Legislature",
      url: "https://malegislature.gov/",
      note: "Official Massachusetts legislative portal.",
    },
    billSearch: {
      label: "Search Massachusetts bills",
      url: "https://malegislature.gov/Bills/Search",
      note: "Official Massachusetts bill search.",
    },
    legislatorLookup: {
      label: "Find Massachusetts legislators",
      url: "https://malegislature.gov/Search/FindMyLegislator",
      note: "Official Massachusetts legislator lookup.",
    },
    calendar: {
      label: "Massachusetts events",
      url: "https://malegislature.gov/Events",
      note: "Official Massachusetts legislative events page.",
    },
  },
  MI: {
    legislature: {
      label: "Michigan Legislature",
      url: "https://www.legislature.mi.gov/",
      note: "Official Michigan legislative portal.",
    },
    billSearch: {
      label: "Search Michigan bills",
      url: "https://www.legislature.mi.gov/Bills/",
      note: "Official Michigan bills page.",
    },
    legislatorLookup: {
      label: "Find Michigan legislators",
      url: "https://www.legislature.mi.gov/",
      note: "Official Michigan legislative portal; use member navigation for district offices.",
    },
  },
  MN: {
    legislature: {
      label: "Minnesota Legislature",
      url: "https://www.leg.mn.gov/",
      note: "Official Minnesota legislative portal.",
    },
    billSearch: {
      label: "Search Minnesota legislation",
      url: "https://www.leg.mn.gov/leg/legis",
      note: "Official Minnesota legislation page.",
    },
    legislatorLookup: {
      label: "Find Minnesota districts",
      url: "https://www.gis.lcc.mn.gov/iMaps/districts/",
      note: "Official Minnesota GIS legislative district finder.",
    },
  },
  MS: {
    legislature: {
      label: "Mississippi Legislature",
      url: "https://www.legislature.ms.gov/",
      note: "Official Mississippi legislative portal.",
    },
    billSearch: {
      label: "Search Mississippi bill status",
      url: "http://billstatus.ls.state.ms.us/",
      note: "Official Mississippi bill status system.",
    },
    legislatorLookup: {
      label: "Find Mississippi legislators",
      url: "https://www.legislature.ms.gov/legislators/",
      note: "Official Mississippi legislator directory.",
    },
  },
  MO: {
    legislature: {
      label: "Missouri House",
      url: "https://house.mo.gov/",
      note: "Official Missouri House portal with legislation, member, hearing, and Senate cross-links.",
    },
    billSearch: {
      label: "Search Missouri legislation",
      url: "https://house.mo.gov/LegislationSP.aspx",
      note: "Official Missouri House legislative report and bill-search route.",
    },
    legislatorLookup: {
      label: "Find Missouri legislators",
      url: "https://www.senate.mo.gov/BillTracking/LegislatorLookup/",
      note: "Official Missouri Senate legislator lookup by ZIP.",
    },
    calendar: {
      label: "Missouri House hearings",
      url: "https://house.mo.gov/AllHearings.aspx",
      note: "Official Missouri House past and upcoming committee hearing page.",
    },
  },
  MT: {
    legislature: {
      label: "Montana Legislature",
      url: "https://leg.mt.gov/",
      note: "Official Montana legislative portal.",
    },
    billSearch: {
      label: "Search Montana bills",
      url: "https://bills.legmt.gov/",
      note: "Official Montana bill system.",
    },
    legislatorLookup: {
      label: "Find Montana legislators",
      url: "https://leg.mt.gov/legislator-lookup/",
      note: "Official Montana legislator lookup.",
    },
  },
  NE: {
    legislature: {
      label: "Nebraska Legislature",
      url: "https://nebraskalegislature.gov/",
      note: "Official Nebraska legislative portal.",
    },
    billSearch: {
      label: "Search Nebraska bills",
      url: "https://nebraskalegislature.gov/bills/",
      note: "Official Nebraska bills page.",
    },
    legislatorLookup: {
      label: "Find Nebraska senator",
      url: "https://nebraskalegislature.gov/senators/senator_find.php",
      note: "Official Nebraska senator lookup.",
    },
  },
  NV: {
    legislature: {
      label: "Nevada Legislature",
      url: "https://www.leg.state.nv.us/",
      note: "Official Nevada legislative portal.",
    },
    billSearch: {
      label: "Search Nevada bills",
      url: "https://www.leg.state.nv.us/App/NELIS/REL/83rd2025/Bills/List",
      note: "Official Nevada NELIS bill list.",
    },
    legislatorLookup: {
      label: "Find Nevada legislators",
      url: "https://www.leg.state.nv.us/Division/Research/Library/FAQ/WhichLegislatorRepresents.html",
      note: "Official Nevada legislative library lookup guidance.",
    },
  },
  NH: {
    legislature: {
      label: "New Hampshire General Court",
      url: "https://www.gencourt.state.nh.us/",
      note: "Official New Hampshire legislative portal.",
    },
    billSearch: {
      label: "Search New Hampshire bills",
      url: "https://gc.nh.gov/bill_Status/",
      note: "Official New Hampshire bill status page.",
    },
    legislatorLookup: {
      label: "Find New Hampshire representatives",
      url: "https://www.gencourt.state.nh.us/house/members/wml.aspx",
      note: "Official New Hampshire House member lookup.",
    },
  },
  NJ: {
    legislature: {
      label: "New Jersey Legislature",
      url: "https://www.njleg.state.nj.us/",
      note: "Official New Jersey legislative portal.",
    },
    billSearch: {
      label: "Search New Jersey bills",
      url: "https://www.njleg.state.nj.us/bill-search",
      note: "Official New Jersey bill search.",
    },
    legislatorLookup: {
      label: "Find New Jersey legislators",
      url: "https://www.njleg.state.nj.us/legislative-roster",
      note: "Official New Jersey legislative roster.",
    },
  },
  NM: {
    legislature: {
      label: "New Mexico Legislature",
      url: "https://www.nmlegis.gov/",
      note: "Official New Mexico legislative portal.",
    },
    billSearch: {
      label: "Search New Mexico bills",
      url: "https://www.nmlegis.gov/Legislation/Bill_Finder",
      note: "Official New Mexico bill finder.",
    },
    legislatorLookup: {
      label: "Find New Mexico legislators",
      url: "https://www.nmlegis.gov/Members/Find_My_Legislator",
      note: "Official New Mexico legislator lookup.",
    },
  },
  NY: {
    legislature: {
      label: "New York Senate",
      url: "https://www.nysenate.gov/",
      note: "Official New York Senate portal.",
    },
    billSearch: {
      label: "Search New York legislation",
      url: "https://nyassembly.gov/leg/",
      note: "Official New York Assembly legislation page.",
    },
    legislatorLookup: {
      label: "Find New York senator",
      url: "https://www.nysenate.gov/find-my-senator",
      note: "Official New York Senate lookup.",
    },
  },
  NC: {
    legislature: {
      label: "North Carolina General Assembly",
      url: "https://www.ncleg.gov/",
      note: "Official North Carolina legislative portal.",
    },
    billSearch: {
      label: "Search North Carolina bills",
      url: "https://www.ncleg.gov/BillLookup",
      note: "Official North Carolina bill lookup.",
    },
    legislatorLookup: {
      label: "Find North Carolina legislators",
      url: "https://www.ncleg.gov/FindYourLegislators",
      note: "Official North Carolina legislator lookup.",
    },
  },
  ND: {
    legislature: {
      label: "North Dakota Legislature",
      url: "https://ndlegis.gov/",
      note: "Official North Dakota legislative portal.",
    },
    billSearch: {
      label: "Search North Dakota legislation",
      url: "https://ndlegis.gov/",
      note: "Official North Dakota legislative portal; use assembly bill navigation for current bill status.",
    },
    legislatorLookup: {
      label: "Find North Dakota legislators",
      url: "https://ndlegis.gov/",
      note: "Official North Dakota legislative portal; use member navigation for district offices.",
    },
  },
  OH: {
    legislature: {
      label: "Ohio Legislature",
      url: "https://www.legislature.ohio.gov/",
      note: "Official Ohio legislative portal.",
    },
    billSearch: {
      label: "Search Ohio legislation",
      url: "https://www.legislature.ohio.gov/legislation/search",
      note: "Official Ohio legislation search.",
    },
    legislatorLookup: {
      label: "Find Ohio districts",
      url: "https://www.legislature.ohio.gov/members/district-maps",
      note: "Official Ohio district and member map page.",
    },
  },
  OK: {
    legislature: {
      label: "Oklahoma Legislature",
      url: "https://www.oklegislature.gov/",
      note: "Official Oklahoma legislative portal.",
    },
    billSearch: {
      label: "Search Oklahoma legislation",
      url: "http://www.oklegislature.gov/advancedsearchform.aspx",
      note: "Official Oklahoma advanced legislative search.",
    },
    legislatorLookup: {
      label: "Find Oklahoma legislators",
      url: "http://www.oklegislature.gov/FindMyLegislature.aspx",
      note: "Official Oklahoma legislator lookup.",
    },
  },
  OR: {
    legislature: {
      label: "Oregon Legislature",
      url: "https://www.oregonlegislature.gov/",
      note: "Official Oregon legislative portal.",
    },
    billSearch: {
      label: "Search Oregon bills",
      url: "https://olis.oregonlegislature.gov/liz/2025R1/Measures/list/",
      note: "Official Oregon legislative information system bill list.",
    },
    legislatorLookup: {
      label: "Find Oregon legislators",
      url: "https://www.oregonlegislature.gov/FindYourLegislator",
      note: "Official Oregon legislator lookup.",
    },
  },
  PA: {
    legislature: {
      label: "Pennsylvania General Assembly",
      url: "https://www.legis.state.pa.us/",
      note: "Official Pennsylvania legislative portal.",
    },
    billSearch: {
      label: "Search Pennsylvania bills",
      url: "https://www.legis.state.pa.us/cfdocs/legis/home/bills/",
      note: "Official Pennsylvania bill search.",
    },
    legislatorLookup: {
      label: "Find Pennsylvania legislators",
      url: "https://www.legis.state.pa.us/cfdocs/legis/home/findyourlegislator/",
      note: "Official Pennsylvania legislator lookup.",
    },
  },
  RI: {
    legislature: {
      label: "Rhode Island General Assembly",
      url: "https://www.rilegislature.gov/",
      note: "Official Rhode Island legislative portal.",
    },
    billSearch: {
      label: "Search Rhode Island bill status",
      url: "https://status.rilegislature.gov/",
      note: "Official Rhode Island bill status system.",
    },
    legislatorLookup: {
      label: "Find Rhode Island representatives",
      url: "https://www.rilegislature.gov/representatives/default.aspx",
      note: "Official Rhode Island representative directory.",
    },
  },
  SC: {
    legislature: {
      label: "South Carolina Legislature",
      url: "https://www.scstatehouse.gov/",
      note: "Official South Carolina legislative portal.",
    },
    billSearch: {
      label: "Search South Carolina bills",
      url: "https://www.scstatehouse.gov/billsearch.php",
      note: "Official South Carolina bill search.",
    },
    legislatorLookup: {
      label: "Find South Carolina legislators",
      url: "https://www.scstatehouse.gov/legislatorssearch.php",
      note: "Official South Carolina legislator search.",
    },
  },
  SD: {
    legislature: {
      label: "South Dakota Legislature",
      url: "https://sdlegislature.gov/",
      note: "Official South Dakota legislative portal.",
    },
    billSearch: {
      label: "Search South Dakota bills",
      url: "https://sdlegislature.gov/Session/Bills/70",
      note: "Official South Dakota session bill list.",
    },
    legislatorLookup: {
      label: "Find South Dakota legislators",
      url: "https://sdlegislature.gov/Legislators/Find",
      note: "Official South Dakota legislator lookup.",
    },
  },
  TN: {
    legislature: {
      label: "Tennessee General Assembly",
      url: "https://www.capitol.tn.gov/",
      note: "Official Tennessee legislative portal.",
    },
    billSearch: {
      label: "Search Tennessee bills",
      url: "https://wapp.capitol.tn.gov/apps/BillInfo/",
      note: "Official Tennessee bill information system.",
    },
    legislatorLookup: {
      label: "Find Tennessee legislators",
      url: "https://wapp.capitol.tn.gov/Apps/fmlv3/lookup.aspx",
      note: "Official Tennessee legislator lookup.",
    },
  },
  TX: {
    legislature: {
      label: "Texas Legislature Online",
      url: "https://capitol.texas.gov/",
      note: "Official Texas legislative portal.",
    },
    billSearch: {
      label: "Search Texas bills",
      url: "https://capitol.texas.gov/BillLookup/BillNumber.aspx",
      note: "Official Texas bill lookup.",
    },
    legislatorLookup: {
      label: "Find Texas legislators",
      url: "https://wrm.capitol.texas.gov/home",
      note: "Official Texas legislator lookup.",
    },
    calendar: {
      label: "Texas hearing calendar",
      url: "https://capitol.texas.gov/Committees/MeetingsByCmte.aspx",
      note: "Official Texas committee meeting calendar.",
    },
  },
  UT: {
    legislature: {
      label: "Utah Legislature",
      url: "https://le.utah.gov/",
      note: "Official Utah legislative portal.",
    },
    billSearch: {
      label: "Search Utah bills",
      url: "https://le.utah.gov/asp/billsintro/index.asp",
      note: "Official Utah introduced bills page.",
    },
    legislatorLookup: {
      label: "Find Utah districts",
      url: "https://le.utah.gov/GIS/findDistrict.jsp",
      note: "Official Utah district lookup.",
    },
  },
  VT: {
    legislature: {
      label: "Vermont Legislature",
      url: "https://legislature.vermont.gov/",
      note: "Official Vermont legislative portal.",
    },
    billSearch: {
      label: "Search Vermont bills",
      url: "https://legislature.vermont.gov/bill/search/2026",
      note: "Official Vermont bill search.",
    },
    legislatorLookup: {
      label: "Find Vermont legislators",
      url: "https://legislature.vermont.gov/people/search/2026",
      note: "Official Vermont legislator search.",
    },
  },
  VA: {
    legislature: {
      label: "Virginia General Assembly",
      url: "https://virginiageneralassembly.gov/",
      note: "Official Virginia legislative portal.",
    },
    billSearch: {
      label: "Search Virginia legislation",
      url: "https://lis.virginia.gov/cgi-bin/legp604.exe?261+lst+ALL",
      note: "Official Virginia legislative information system list.",
    },
    legislatorLookup: {
      label: "Find Virginia legislators",
      url: "https://whosmy.virginiageneralassembly.gov/",
      note: "Official Virginia legislator lookup.",
    },
  },
  WA: {
    legislature: {
      label: "Washington State Legislature",
      url: "https://leg.wa.gov/",
      note: "Official Washington legislative portal.",
    },
    billSearch: {
      label: "Search Washington bills",
      url: "https://app.leg.wa.gov/billinfo/",
      note: "Official Washington bill information page.",
    },
    legislatorLookup: {
      label: "Find Washington districts",
      url: "https://app.leg.wa.gov/districtfinder/",
      note: "Official Washington district finder.",
    },
  },
  WV: {
    legislature: {
      label: "West Virginia Legislature",
      url: "https://www.wvlegislature.gov/",
      note: "Official West Virginia legislative portal.",
    },
    billSearch: {
      label: "Search West Virginia bill status",
      url: "https://www.wvlegislature.gov/Bill_Status/bill_status.cfm",
      note: "Official West Virginia bill status page.",
    },
    legislatorLookup: {
      label: "Find West Virginia districts",
      url: "https://www.wvlegislature.gov/Districts/maps.cfm",
      note: "Official West Virginia district map page.",
    },
  },
  WI: {
    legislature: {
      label: "Wisconsin Legislature",
      url: "https://legis.wisconsin.gov/",
      note: "Official Wisconsin legislative portal.",
    },
    billSearch: {
      label: "Search Wisconsin proposals",
      url: "https://docs.legis.wisconsin.gov/2025/proposals",
      note: "Official Wisconsin proposal index.",
    },
    legislatorLookup: {
      label: "Find Wisconsin legislators",
      url: "https://maps.legis.wisconsin.gov/",
      note: "Official Wisconsin legislative map lookup.",
    },
  },
  WY: {
    legislature: {
      label: "Wyoming Legislature",
      url: "https://www.wyoleg.gov/",
      note: "Official Wyoming legislative portal.",
    },
    billSearch: {
      label: "Search Wyoming legislation",
      url: "https://www.wyoleg.gov/Legislation",
      note: "Official Wyoming legislation page.",
    },
    legislatorLookup: {
      label: "Find Wyoming legislators",
      url: "https://www.wyoleg.gov/Legislators",
      note: "Official Wyoming legislator directory.",
    },
  },
};
