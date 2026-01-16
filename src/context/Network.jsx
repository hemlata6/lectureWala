import axios from "axios";
import Endpoints from "./endpoints";
import instId from '../context/instituteId';

// Global function to handle token expiration
const handleTokenExpiration = () => {
  // Clear all authentication data
  localStorage.removeItem('authToken');
  localStorage.removeItem('studentData');
  localStorage.removeItem('user');
  localStorage.removeItem('studentAuth');

  // Dispatch custom event to notify contexts
  window.dispatchEvent(new CustomEvent('tokenExpired', {
    detail: { expired: true }
  }));

  // Force page reload to redirect to login
  setTimeout(() => {
    window.location.reload();
  }, 100);
};

// Add axios response interceptor to handle token expiration globally
axios.interceptors.response.use(
  (response) => {
    // If response is successful, return as normal
    return response;
  },
  (error) => {
    // Check if error is due to token expiration
    if (error.response) {
      const { status, data } = error.response;

      // Common patterns for expired token responses
      const isTokenExpired =
        status === 401 ||
        status === 403 ||
        (data && (
          data.message?.toLowerCase().includes('token') ||
          data.message?.toLowerCase().includes('unauthorized') ||
          data.status === false && data.message?.toLowerCase().includes('expired') ||
          data.error?.toLowerCase().includes('token')
        ));

      if (isTokenExpired) {
        console.log('API returned token expiration error:', {
          status,
          message: data.message || data.error,
          url: error.config?.url
        });
        handleTokenExpiration();
      }
    }

    // Re-throw error for normal error handling
    return Promise.reject(error);
  }
);

export default class Network {

  // Static method to manually handle token expiration
  static handleTokenExpiration = handleTokenExpiration;

  static BANNER_URL = Endpoints.baseURL + "/admin/banner/fetch-public-banner/";
  static FETCH_PUBLIC_EMPLOYEE = Endpoints.baseURL + "/admin/employee/fetch-public-employee/";
  static COURSES_URL = Endpoints.baseURL + "admin/course/fetch-public/";
  static FETCH_TAGS_URL = Endpoints.baseURL + "admin/course/fetch-tags-public/";
  static FETCH_COURSE_SCHEDULR_URL = Endpoints.baseURL + "admin/course/fetchContent-public/";
  static GET_SHORTS_URL = Endpoints.baseURL + "/student/shortVideo/fetch-public/";
  static FETCH_BANNERS_URL = Endpoints.baseURL + "admin/banner/fetch-public-banner/";
  static FETCH_PUBLIC_COURSE_BY_ID_URL = Endpoints.baseURL + 'admin/course/fetch/';
  static BUY_COURSE_SECOND_URL = Endpoints.baseURL + "/admin/course/fetch";
  static FETCH_DOMAIN_URL = Endpoints.baseURL + 'domain/fetch-public?instId=';
  static FETCH_INSTITUTE_URL = Endpoints.baseURL + '/getMetaData/fetch-institute/';
  static FETCH_ACTIVE_ANNOUNCEMENTS_URL = Endpoints.baseURL + '/admin/announcement/fetch-active-announcement/';
  static CREATE_LEAD_FORM_URL = Endpoints.baseURL + 'leadManagement/create-lead-form';
  static TEST_SERIES_URL = Endpoints.baseURL + "/admin/quiz/test-series/fetch-public/";

  //  Student APIS

  static instituteUrl = Endpoints.baseURL + "/getMetaData/fetch-institute/";
  static stateUrl = Endpoints.baseURL + "/getMetaData/state";
  static sendLoginOtpUrl = Endpoints.baseURL + "/student/send-login-otp/";
  static verifyLoginOtpUrl = Endpoints.baseURL + "/student/verify-login-otp";
  static signUpSendOtpUrl = Endpoints.baseURL + "/student/signup/sendOtp";
  static signUpVerifyOtpUrl = Endpoints.baseURL + "/student/signup/verifyOtp";
  static studentSignup = Endpoints.baseURL + "student/signup";
  static studentLogOut = Endpoints.baseURL + "/student/logout";
  static studentLoginUrl = Endpoints.baseURL + "/student/login";
  static studentBannerFetchUrl = Endpoints.baseURL + "/student/banner/fetch";
  static studentAnnouncementFetchUrl = Endpoints.baseURL + "/admin/announcement/fetch-active-announcement/";
  static studentCourseFetchUrl = Endpoints.baseURL + "student/course/fetch";
  static studentFreeCourseFetchUrl = Endpoints.baseURL + "/admin/course/fetch-public/";
  static studentFreeCourseFetchUrlWithToken = Endpoints.baseURL + "student/course/fetch";
  static studentLeadFormUrl = Endpoints.baseURL + "leadManagement/create-lead-form";
  static studentFetchScheduleUrl = Endpoints.baseURL + "/student/course/fetchContent/";
  static studentFreePublicFetchScheduleUrl = Endpoints.baseURL + "/admin/course/fetchContent-public/";
  static studentFreeAuthStudentContent = Endpoints.baseURL + "student/course/fetchContent/";
  static studentFetchShortVideoUrl = Endpoints.baseURL + "/student/shortVideo/fetch-public/";
  static studentFetchMyCourseUrl = Endpoints.baseURL + "/student/course/fetchMyCourse";
  static studentFetchPortfolioUrl = Endpoints.baseURL + "/student/portfolio/fetch-all";
  static studentFetchPortfolioCommentUrl = Endpoints.baseURL + "/student/portfolio/fetch-comment";
  static studentAddPortfolioCommentUrl = Endpoints.baseURL + "/student/portfolio/add-comment";
  static studentDeletePortfolioCommentUrl = Endpoints.baseURL + "/student/portfolio/delete-comment";
  static studentDeletePostUrl = Endpoints.baseURL + "/student/portfolio/delete-post";
  static studentLikeUnlikePostUrl = Endpoints.baseURL + "/student/portfolio/like-unlike";
  static studentQuizWiseQuestionUrl = Endpoints.baseURL + "student/test/fetch-questions";
  static studentSubmitQuizUrl = Endpoints.baseURL + "student/test/submit-quiz";
  static studentFetchSolutionUrl = Endpoints.baseURL + "student/test/fetch-solution";
  static studentEditProfileUrl = Endpoints.baseURL + "/student/edit-profile";
  static studentEditProfilePicUrl = Endpoints.baseURL + "/student/edit-profile-pic";
  static studentFetchQuiz = Endpoints.baseURL + "student/test/fetch-quiz";


  static async fetchQuizs(auth, body) {
    let requestOptions = {
      headers: { "X-Auth": auth },
      withCredentials: false,
    };
    const response = await axios.post(this.studentFetchQuiz, body, requestOptions);
    return response.data;
  };


  static async getInstitute() {
    let requestOptions = {
      withCredentials: false,
    };
    const response = await axios.get(this.instituteUrl + instId, requestOptions);
    return response.data;
  };

  static async getStateAPI() {
    let requestOptions = {
      withCredentials: false,
    };
    const response = await axios.get(this.stateUrl, instId, requestOptions);
    return response.data;
  };

  static async sendLoginOtp(contact) {
    let requestOptions = {
      withCredentials: false,
    };
    const response = await axios.get(this.sendLoginOtpUrl + instId + "/" + contact, requestOptions);
    return response.data;
  };

  static async fetchScheduleApi(auth, courseId, parentId) {
    try {
      let requestOptions = {
        headers: { "X-Auth": auth },
        withCredentials: false,
      };
      const response = await axios.get(this.studentFetchScheduleUrl + courseId + "/" + parentId, requestOptions);
      return response.data;
    } catch (error) {
      // Additional check for this critical API
      if (error.response?.status === 401) {
        console.log('Schedule API returned 401, token likely expired');
      }
      throw error;
    }
  };
  static async fetchFreePublicScheduleApi(courseId, parentId) {
    try {
      let requestOptions = {
        // headers: { "X-Auth": auth },
        withCredentials: false,
      };
      const response = await axios.get(this.studentFreePublicFetchScheduleUrl + courseId + "/" + parentId, requestOptions);
      return response.data;
    } catch (error) {
      // Additional check for this critical API
      if (error.response?.status === 401) {
      }
      throw error;
    }
  };

  static async fetchAuthStudentContent(courseId, parentId, auth) {
    try {
      let requestOptions = {
        headers: { "X-Auth": auth },
        withCredentials: false,
      };
      const response = await axios.get(this.studentFreeAuthStudentContent + courseId + "/" + parentId, requestOptions);
      return response.data;
    } catch (error) {
      // Additional check for this critical API
      if (error.response?.status === 401) {
      }
      throw error;
    }
  };

  static async verifyLoginOtp(body) {
    let requestOptions = {
      withCredentials: false,
    };
    const response = await axios.post(this.verifyLoginOtpUrl, body, requestOptions);
    return response.data;
  };

  static async signUpSendOtp(body) {
    let requestOptions = {
      withCredentials: false,
    };
    const response = await axios.post(this.signUpSendOtpUrl, body, requestOptions);
    return response.data;
  };

  static async signUpVerifyOtp(body) {
    let requestOptions = {
      withCredentials: false,
    };
    const response = await axios.post(this.signUpVerifyOtpUrl, body, requestOptions);
    return response.data;
  };

  static async studentRegister(body) {
    let requestOptions = {
      withCredentials: false,
    };
    const response = await axios.post(this.studentSignup, body, requestOptions);
    return response.data;
  };

  static async studentLogIn(body) {
    let requestOptions = {
      withCredentials: false,
    };
    const response = await axios.post(this.studentLoginUrl, body, requestOptions);
    return response.data;
  };

  static async studentLogout(auth) {
    let requestOptions = {
      headers: { "X-Auth": auth },
      withCredentials: false,
    };
    const response = await axios.get(this.studentLogOut, requestOptions);
    return response.data;
  };

  static async getBannerList(auth) {
    let requestOptions = {
      headers: { "X-Auth": auth },
      withCredentials: false,
    };
    const response = await axios.get(this.studentBannerFetchUrl, requestOptions);
    return response.data;
  };
  static async getCourseList(auth) {
    let requestOptions = {
      headers: { "X-Auth": auth },
      withCredentials: false,
    };
    const response = await axios.get(this.studentCourseFetchUrl, requestOptions);
    return response.data;
  };

  static async getFreeCourseList(instId) {
    let requestOptions = {
      // headers: { "X-Auth": auth },
      withCredentials: false,
    };
    const response = await axios.get(this.studentFreeCourseFetchUrl + instId, requestOptions);
    return response.data;
  };

  static async getStudentAuthCourse(auth) {
    let requestOptions = {
      headers: { "X-Auth": auth },
      withCredentials: false,
    };
    const response = await axios.get(this.studentFreeCourseFetchUrlWithToken, requestOptions);
    return response.data;
  };
  static async getAnnouncementList(instId) {
    let requestOptions = {
      // headers: { "X-Auth": auth },
      withCredentials: false,
    };
    const response = await axios.get(this.studentAnnouncementFetchUrl + instId, requestOptions);
    return response.data;
  };

  static async submitLeadForm(body) {
    let requestOptions = {
      // headers: { "X-Auth": auth },
      withCredentials: false,
    };
    const response = await axios.post(this.studentLeadFormUrl, body, requestOptions);
    return response.data;
  };

  static async getStudentShortsApi(instId, body) {
    let requestOptions = {
      // headers: { "X-Auth": auth },
      withCredentials: false,
    };
    const response = await axios.post(this.studentFetchShortVideoUrl + instId, body, requestOptions);
    return response.data;
  };

  static async getMyCourses(auth) {
    let requestOptions = {
      headers: { "X-Auth": auth },
      withCredentials: false,
    };
    const response = await axios.get(this.studentFetchMyCourseUrl, requestOptions);
    return response.data;
  };

  static async getMyPortfolio(auth, body) {
    let requestOptions = {
      headers: { "X-Auth": auth },
      withCredentials: false,
    };
    const response = await axios.post(this.studentFetchPortfolioUrl, body, requestOptions);
    return response.data;
  };

  static async addStudentComment(auth, body) {
    let requestOptions = {
      headers: { "X-Auth": auth },
      withCredentials: false,
    };
    const response = await axios.post(this.studentAddPortfolioCommentUrl, body, requestOptions);
    return response.data;
  };

  static async deleteStudentComment(auth, commentId) {
    let requestOptions = {
      headers: { "X-Auth": auth },
      withCredentials: false,
    };
    const response = await axios.get(this.studentDeletePortfolioCommentUrl + "/" + commentId, requestOptions);
    return response.data;
  };

  static async deleteStudentPost(auth, postId) {
    let requestOptions = {
      headers: { "X-Auth": auth },
      withCredentials: false,
    };
    const response = await axios.get(this.studentDeletePostUrl + "/" + postId, requestOptions);
    return response.data;
  };

  static async getStudentFetchComment(auth, postId) {
    let requestOptions = {
      headers: { "X-Auth": auth },
      withCredentials: false,
    };
    const response = await axios.get(this.studentFetchPortfolioCommentUrl + "/" + postId, requestOptions);
    return response.data;
  };

  static async getStudentLikeUnlikePost(auth, postId) {
    let requestOptions = {
      headers: { "X-Auth": auth },
      withCredentials: false,
    };
    const response = await axios.get(this.studentLikeUnlikePostUrl + "/" + postId, requestOptions);
    return response.data;
  };

  static async getQuestionList(auth, quizId) {
    let requestOptions = {
      headers: { "X-Auth": auth },
      withCredentials: false,
    };
    const response = await axios.get(this.studentQuizWiseQuestionUrl + "/" + quizId, requestOptions);
    return response.data;
  };

  static async submitQuiz(auth, body) {
    let requestOptions = {
      headers: { "X-Auth": auth },
      withCredentials: false,
    };
    const response = await axios.post(this.studentSubmitQuizUrl, body, requestOptions);
    return response.data;
  };

  static async fetchSolution(auth, quizId) {
    let requestOptions = {
      headers: { "X-Auth": auth },
      withCredentials: false,
    };
    const response = await axios.get(this.studentFetchSolutionUrl + "/" + quizId, requestOptions);
    return response.data;
  };

  static async editStudentProfile(auth, body) {
    let requestOptions = {
      headers: { "X-Auth": auth },
      withCredentials: false,
    };
    const response = await axios.post(this.studentEditProfileUrl, body, requestOptions);
    return response.data;
  };

  static async editStudentProfilePic(auth, body) {
    let requestOptions = {
      headers: { "X-Auth": auth },
      withCredentials: false,
    };
    const response = await axios.post(this.studentEditProfilePicUrl, body, requestOptions);
    return response.data;
  };

  static async assignFreeAccess(auth, body) {
    let requestOptions = {
      headers: { "X-Auth": auth },
      withCredentials: false,
    };
    const response = await axios.post(Endpoints.baseURL + 'payment/assign-access-for-free', body, requestOptions);
    return response.data;
  };



  // End of Students APIS

  static async fetchDomain(instId) {
    // console.log("instId", instId);
    let requestOptions = {
      // headers: { "X-Auth": token },
      withCredentials: false,
    };
    const response = await axios.get(this.FETCH_DOMAIN_URL + instId, requestOptions);
    return response.data;
  };

  // static async fetchAnnouncements(instId) {
  //   // console.log("instId", instId);
  //   let requestOptions = {
  //     // headers: { "X-Auth": token },
  //     withCredentials: false,
  //   };
  //   const response = await axios.get(this.FETCH_ACTIVE_ANNOUNCEMENTS_URL + instId, requestOptions);
  //   return response.data;
  // };

  // static async fetchInstitute(instId) {
  //   // console.log("instId", instId);
  //   let requestOptions = {
  //     // headers: { "X-Auth": token },
  //     withCredentials: false,
  //   };
  //   const response = await axios.get(this.FETCH_INSTITUTE_URL + instId, requestOptions);
  //   return response.data;
  // };

  // static async fetchBannerss(instId) {
  //   let requestOptions = {
  //     // headers: { "X-Auth": token },
  //     withCredentials: false,
  //   };
  //   const response = await axios.get(
  //     this.BANNER_URL + "/" + instId,
  //     requestOptions
  //   );
  //   return response.data;
  // }

  // static async fetchEmployee(instId) {
  //   const response = await axios.get(this.FETCH_PUBLIC_EMPLOYEE + instId,);
  //   return response.data;
  // }
  // static async fetchCourses(instId) {
  //   let requestOptions = {
  //     withCredentials: false,
  //   };
  //   const response = await axios.get(this.COURSES_URL + instId, requestOptions);
  //   return response.data;
  // };
  // static async fetchTestSeries(instId) {
  //   let requestOptions = {
  //     withCredentials: false,
  //   };
  //   const response = await axios.get(this.TEST_SERIES_URL + instId, requestOptions);
  //   return response.data;
  // }
  static async fetchTags(instId) {
    let requestOptions = {
      withCredentials: false,
    };
    const response = await axios.get(this.FETCH_TAGS_URL + instId, requestOptions);
    return response.data;
  };

  // static async getShortsPublicApi(body, instId) {
  //   let requestOptions = {
  //     withCredentials: false,
  //   };
  //   const response = await axios.post(this.GET_SHORTS_URL + instId, body, requestOptions);
  //   return response.data;
  // };

  static async createLeadFormAPI(body, instId) {
    let requestOptions = {
      withCredentials: false,
    };
    const response = await axios.post(this.CREATE_LEAD_FORM_URL, body, requestOptions);
    return response.data;
  };

  // static async fetchStudentShorts(instId) {
  //   let requestOptions = {
  //     withCredentials: false,
  //   };
  //   const response = await axios.get(this.GET_SHORTS_URL + instId, requestOptions);
  //   return response.data;
  // };


  // static async fetchCheduleApi(courseId, contentId) {
  //   let requestOptions = {
  //     withCredentials: false,
  //   };
  //   const response = await axios.get(this.FETCH_COURSE_SCHEDULR_URL + courseId + '/' + contentId, requestOptions);

  //   return response.data;
  // };

  // static async getBannersApi(instId) {
  //   let requestOptions = {
  //     withCredentials: false,
  //   };
  //   const response = await axios.get(this.FETCH_BANNERS_URL + instId, requestOptions);
  //   return response.data;
  // };

  static async fetchCourseById(courseId) {
    // console.log("instId", instId);
    let requestOptions = {
      // headers: { "X-Auth": token },
      withCredentials: false,
    };
    const response = await axios.get(this.FETCH_PUBLIC_COURSE_BY_ID_URL + courseId, requestOptions);
    return response.data;
  };

  static async getBuyCourseDetailsSecond(courseId) {
    let requestOptions = {
      // headers: { "X-Auth": token },
      withCredentials: false,
    };
    const response = await axios.get(
      this.BUY_COURSE_SECOND_URL + "/" + courseId,
      requestOptions
    );
    return response.data;
  }

}
