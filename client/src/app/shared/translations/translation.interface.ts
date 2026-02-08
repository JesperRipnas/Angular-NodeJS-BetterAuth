export interface Translation {
  shared: {
    loading: string;
    defaultError: string;
    login: string;
    logout: string;
    myProfile: string;
    signup: string;
    yes: string;
    no: string;
    pagination: {
      previous: string;
      next: string;
    };
  };
  header: {
    switchToSwedish: string;
    switchToEnglish: string;
    switchToLightMode: string;
    switchToDarkMode: string;
  };
  auth: {
    email: string;
    password: string;
    loginButton: string;
    signupButton: string;
    orContinueWith: string;
    errors: {
      invalidEmail: string;
      invalidCredentials: string;
      loginFailed: string;
      signupFailed: string;
    };
    login: {
      title: string;
      usernameOrEmail: string;
      usernameOrEmailPlaceholder: string;
      emailPlaceholder: string;
      passwordPlaceholder: string;
      noAccountText: string;
    };
    signup: {
      title: string;
      firstNameLabel: string;
      firstNamePlaceholder: string;
      lastNameLabel: string;
      lastNamePlaceholder: string;
      usernameLabel: string;
      usernamePlaceholder: string;
      genderPlaceholder: string;
      genderMale: string;
      genderFemale: string;
      genderOther: string;
      genderPreferNotToSay: string;
      emailPlaceholder: string;
      passwordPlaceholder: string;
      confirmPasswordLabel: string;
      confirmPasswordPlaceholder: string;
      haveAccountText: string;
      loginLink: string;
      passwordsDoNotMatch: string;
    };
  };
  profile: {
    title: string;
    subtitle: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    birthDate: string;
    verifiedEmail: string;
  };
  sidebar: {
    dashboard: string;
    overview: string;
    analytics: string;
    projects: string;
    groups: string;
    reports: string;
    settings: string;
    users: string;
    profile: string;
  };
  cookies: {
    message: string;
    accept: string;
    decline: string;
  };
  admin: {
    title: string;
    users: {
      title: string;
      subtitle: string;
      filters: {
        show: string;
        hide: string;
      };
      search: {
        label: string;
        placeholder: string;
        help: string;
        noResults: string;
        roleLabel: string;
        allRoles: string;
        verificationLabel: string;
        verified: string;
        unverified: string;
      };
      noUsers: string;
      table: {
        username: string;
        email: string;
        name: string;
        verifiedEmail: string;
        role: string;
        actions: string;
      };
      buttons: {
        edit: string;
        delete: string;
        deleteConfirm: string;
        save: string;
        cancel: string;
      };
      modal: {
        editTitle: string;
        firstName: string;
        lastName: string;
        email: string;
        birthDate: string;
        role: string;
        lastAdminWarning: string;
      };
      messages: {
        deleteSuccess: string;
        deleteError: string;
        saveSuccess: string;
        saveError: string;
        lastAdminDeleteProtection: string;
        confirmDelete: string;
      };
      roles: {
        user: string;
        admin: string;
        seller: string;
      };
    };
  };
}
