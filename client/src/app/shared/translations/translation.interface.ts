export interface Translation {
  shared: {
    confirm: string;
    loading: string;
    defaultError: string;
    login: string;
    logout: string;
    save: string;
    cancel: string;
    myProfile: string;
    signup: string;
    yes: string;
    no: string;
    openMenu: string;
    closeMenu: string;
    pagination: {
      previous: string;
      next: string;
      pageSize: string;
      pageSizeAria: string;
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
      emailTaken: string;
      usernameTaken: string;
      passwordTooShort: string;
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
      analytics: {
        title: string;
        subtitle: string;
        totalUsers: string;
        paymentTiers: string;
        tierFree: string;
        tierStarter: string;
        tierPro: string;
        tierEnterprise: string;
        signupsLastMonths: string;
        premiumUsersPlaceholder: string;
        earningsPlaceholder: string;
        earningsLast30Days: string;
        earningsLast6Months: string;
      };
      filters: {
        show: string;
        hide: string;
        clear: string;
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
        createdAt: string;
        updatedAt: string;
        verifiedEmail: string;
        role: string;
        actions: string;
      };
      buttons: {
        edit: string;
        delete: string;
        deleteUser: string;
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
        usernameTaken: string;
        usernameUniqueHint: string;
        usernameInvalidHint: string;
        firstnameInvalidHint: string;
        lastnameInvalidHint: string;
        emailInvalidHint: string;
      };
      roles: {
        user: string;
        admin: string;
        seller: string;
      };
    };
  };
}
