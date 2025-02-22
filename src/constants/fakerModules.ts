export const FAKER_MODULES = {
  internet: {
    label: "Internet",
    methods: {
      userName: "Username",
      email: "Email Address",
      password: "Password",
      url: "URL",
      ip: "IP Address",
      avatar: "Avatar URL",
    },
  },
  name: {
    label: "Person",
    methods: {
      firstName: "First Name",
      lastName: "Last Name",
      fullName: "Full Name",
      jobTitle: "Job Title",
    },
  },
  phone: {
    label: "Phone",
    methods: {
      number: "Phone Number",
      imei: "IMEI",
    },
  },
  address: {
    label: "Address",
    methods: {
      streetAddress: "Street Address",
      city: "City",
      state: "State",
      country: "Country",
      zipCode: "Zip Code",
    },
  },
  company: {
    label: "Company",
    methods: {
      name: "Company Name",
      catchPhrase: "Catch Phrase",
      bs: "Business Statement",
    },
  },
  lorem: {
    label: "Text",
    methods: {
      word: "Single Word",
      words: "Multiple Words",
      sentence: "Sentence",
      paragraph: "Paragraph",
    },
  },
  date: {
    label: "Date",
    methods: {
      past: "Past Date",
      future: "Future Date",
      recent: "Recent Date",
    },
  },
  number: {
    label: "Number",
    methods: {
      int: "Integer",
      float: "Float",
    },
  },
};

export const FIELD_TYPES = [
  { value: "simple", label: "Simple Value" },
  { value: "object", label: "Object" },
  { value: "array", label: "Array" },
] as const; 