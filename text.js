const finalQuestions = [
  {
    label: "What would you like our office to assist with?",
    questionType: "textarea",
    options: []
  },
  {
    label: "ACKNOWLEDGEMENT AND ACCEPTANCE",
    questionType: "checkbox",
    options: [
      "I acknowledge that I have read and hereby accept the above privacy policy regarding use of my personal information."
    ]
  },
  {
    label: "Disclosure Consent: By completing this page, I consent to my above-stated personal identification and contact information being disclosed to banking and/or financial institutions and governmental and regulatory authorities who may make requests for such information in pursuance of their obligations under taxation laws and laws and regulations in force to protect against money-laundering and financing of terrorism.",
    questionType: "checkbox",
    options: []
  },
  
];

const decedentFinalQuestions = [
  {
    label: "To the best of your knowledge, please set out what you know the Deceased to have owned (real property, bank accounts, insurance policies)",
    questionType: "textarea",
    options: []
  },
  {
    label: "Do you know which funeral home or company hosted the funeral of the Deceased?",
    questionType: "text",
    options: []
  },
  {
    label: "Who paid for the funeral?",
    questionType: "text",
    options: []
  },
  {
    label: "What was the cost?",
    questionType: "text",
    options: []
  },
  {
    label: "Was the Deceased married at the time of death?",
    questionType: "radio",
    options: ["Yes", "No"],
    follow_up_if_yes: {
      Yes: {
        label: "If so, please provide the name and contact details for the spouse of the Deceased?",
        questionType: "text"
      }
    }
  },
  {
    label: "Did the Deceased have children at the time of death? If so, please name and provide contact information",
    questionType: "textarea",
    options: []
  },
  {
    label: "Are any of the Deceased's children minors?",
    questionType: "text",
    options: []
  },
  {
    label: "Please consider whether any of the following applies to the Deceased?",
    questionType: "checkbox",
    options: [
      "Deceased owns rental or other income-producing property",
      "Deceased has known creditors",
      "Deceased received private care by family or other non-paid worker prior to death",
      "Deceased has minor or disabled children",
      "Estate proceedings have been filed in another country or state",
      "Client or other person served as guardian",
      "Client or other person served as agent under power of attorney",
      "Money may have been withdrawn without decedent’s consent prior to death",
      "Deceased had signed trust of any kind",
      "Client believes that controversy may arise among family members or other family has already hired attorney",
      "The Executor or Executrix is failing or refusing to share or disclose the contents of the Last Will and Testament or make a copy available for viewing"
    ]
  }
];


const decedentFollowUpQuestions = [
  {
    label: "What was the cause of death?",
    questionType: "text",
    options: []
  },
  {
    label: "Do you have a copy of the Death Certificate. If so, please attach?",
    questionType: "file",
    options: []
  },
  {
    label: "Did the Deceased have or leave a Last Will and Testament?",
    questionType: "radio",
    options: ["Yes", "No"]
  },
  {
    label: "Do you have a copy of the Last Will and Testament. If so, please attach?",
    questionType: "file",
    options: []
  },
  {
    label: "Do you have or know of the location of the original Will?",
    questionType: "radio",
    options: ["Yes", "No"]
  }
];


const legalAndDecedentQuestions = [
  {
    label: "If our law firm ends up representing you in this matter, will you be the person who pays the legal fees?",
    questionType: "radio",
    options: ["Yes", "No"]
  },
  {
    label: "How do you plan to pay?",
    questionType: "text",
    options: [],
    condition: "Yes"
  },
  {
    label: "Input the full name of the person who will pay the legal fees:",
    questionType: "text",
    options: [],
    condition: "No"
  },
  {
    label: "Input his/her phone number:",
    questionType: "text",
    options: [],
    condition: "No"
  },
  {
    label: "Input his/her email address:",
    questionType: "text",
    options: [],
    condition: "No"
  },
  {
    label: "Decedent Information: What is the name of the person who has died?",
    questionType: "text",
    options: []
  },
  {
    label: "Where was the Deceased residing at the time of his or her death?",
    questionType: "text",
    options: []
  },
  {
    label: "What is the date of death?",
    questionType: "date",
    options: []
  },
  {
    label: "How old was the Deceased when he or she died?",
    questionType: "text",
    options: []
  }
];


const referralQuestions = [
  {
    label: "How were you referred to our law firm?",
    questionType: "radio",
    options: [
      "Friend or family member",
      "Another attorney",
      "Online search or lawyer directory website",
      "Billboard, bus stop, phone book, newspaper, or other physical advertisement",
      "Radio or TV advertisement",
      "Bar association",
      "Other"
    ]
  },
  {
    label: "Input the person's full name",
    questionType: "text",
    options: [],
    condition: "Friend or family member"
  },
  {
    label: "Input the attorney's full name",
    questionType: "text",
    options: [],
    condition: "Another attorney"
  },
  {
    label: "Input the name of the website",
    questionType: "text",
    options: [],
    condition: "Online search or lawyer directory website"
  },
  {
    label: "Where was the ad located?",
    questionType: "text",
    options: [],
    condition: "Billboard, bus stop, phone book, newspaper, or other physical advertisement"
  },
  {
    label: "What radio or TV station?",
    questionType: "text",
    options: [],
    condition: "Radio or TV advertisement"
  },
  {
    label: "Which Bar Association?",
    questionType: "text",
    options: [],
    condition: "Bar association"
  },
  {
    label: "Please explain how you found us",
    questionType: "text",
    options: [],
    condition: "Other"
  }
];


const employmentStatusQuestions = [
  {
    label: "Are you currently employed?",
    questionType: "radio",
    options: ["Yes", "No"]
  },
  {
    label: "Employer Name",
    questionType: "text",
    options: [],
    condition: "Yes"
  },
  {
    label: "Job Title",
    questionType: "text",
    options: [],
    condition: "Yes"
  },
  {
    label: "Employer Phone Number",
    questionType: "text",
    options: [],
    condition: "Yes"
  },
  {
    label: "Employer Address",
    questionType: "text",
    options: [],
    condition: "Yes"
  },
  {
    label: "Current Salary",
    questionType: "text",
    options: [],
    condition: "Yes"
  }
];


const maritalStatusQuestion = [
  {
    label: "Marital Status",
    questionType: "radio",
    options: ["Single", "Married", "Separated", "Divorced", "Widowed"]
  },
  {
    label: "Spouse's Full Name",
    questionType: "text",
    options: [],
    condition: "Married"
  },
  {
    label: "Spouse's Full Name",
    questionType: "text",
    options: [],
    condition: "Separated"
  },
  {
    label: "Former Spouse's Full Name",
    questionType: "text",
    options: [],
    condition: "Divorced"
  },
  {
    label: "Former Spouse's Full Name",
    questionType: "text",
    options: [],
    condition: "Widowed"
  }
];


const personalInfoQuestions = [
  {
    label: "Social Security Number",
    questionType: "text",
    options: []
  },
  {
    label: "Driver's License Number",
    questionType: "text",
    options: []
  },
  {
    label: "Marital Status",
    questionType: "radio",
    options: [] // No options were listed in the provided HTML
  }
];


const extraFormQuestions = [
  {
    label: "Preferred Contact Method",
    questionType: "dropdown",
    options: ["Email", "Phone", "No Preference"]
  },
  {
    label: "Date of Birth",
    questionType: "date", // This is a text input with a format="MM/DD/YYYY"
    options: []
  },
  {
    label: "Gender",
    questionType: "radio",
    options: ["Male", "Female"]
  }
];


const phoneNumberSectionQuestions = [
  {
    label: "Phone number",
    questionType: "tel",
    options: []
  },
  {
    label: "Phone type",
    questionType: "dropdown",
    options: ["Work", "Home", "Mobile", "Fax", "Pager", "Skype", "Other"]
  },
  {
    label: "Primary phone selection",
    questionType: "radio",
    options: ["Primary"]
  }
];

const addressSectionQuestions = [
  {
    label: "Street address",
    questionType: "textarea",
    options: []
  },
  {
    label: "Country",
    questionType: "dropdown",
    options: ["Australia", "Canada", "United Kingdom", "United States", /* ... and many more */]
  },
  {
    label: "City",
    questionType: "text",
    options: []
  },
  {
    label: "State/Region",
    questionType: "dropdown",
    options: ["Alaska", "Alabama", "Arkansas", "American Samoa", "Arizona", "California", /* etc. */]
  },
  {
    label: "Province/Region",
    questionType: "text",
    options: []
  },
  {
    label: "Zip/Postal code",
    questionType: "text",
    options: []
  },
  {
    label: "Address type",
    questionType: "dropdown",
    options: ["Work", "Billing", "Home", "Other"]
  },
  {
    label: "Primary address selection",
    questionType: "radio",
    options: ["Primary", "Default address false"]
  }
];


const emailSectionQuestions = [
  {
    label: "Email address",
    questionType: "email",
    options: []
  },
  {
    label: "Email type",
    questionType: "dropdown",
    options: ["Work", "Home", "Other"]
  },
  {
    label: "Primary email selection",
    questionType: "radio",
    options: ["Primary", "Default email false"]
  }
];

const formQuestions = [
  {
    label: "Prefix",
    questionType: "text",
    options: []
  },
  {
    label: "First name",
    questionType: "text",
    options: []
  },
  {
    label: "Middle name",
    questionType: "text",
    options: []
  },
  {
    label: "Last name",
    questionType: "text",
    options: []
  },
  {
    label: "Date of birth",
    questionType: "text", // Technically a text input with date formatting
    options: []
  },
  {
    label: "Company",
    questionType: "text",
    options: []
  }
];


