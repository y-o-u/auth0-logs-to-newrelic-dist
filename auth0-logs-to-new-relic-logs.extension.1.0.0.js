module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 24);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1).config();

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("auth0-extension-tools@1.3.1");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const winston = __webpack_require__(35);

winston.emitErrs = true;

const logger = new winston.Logger({
  transports: [new winston.transports.Console({
    timestamp: true,
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true
  })],
  exitOnError: false
});

module.exports = logger;
module.exports.stream = {
  write: message => {
    logger.info(message.replace(/\n$/, ''));
  }
};

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("auth0-extension-express-tools@2.0.0");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("express@4.17.1");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("lodash@4.8.2");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("bluebird@3.4.6");

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

const Promise = __webpack_require__(6);
const request = __webpack_require__(12);
const querystring = __webpack_require__(31);
const tools = __webpack_require__(1);

function LogsApiClient(options) {
  if (options === null || options === undefined) {
    throw new tools.ArgumentError('Must provide an options object');
  }

  if (options.domain === null || options.domain === undefined) {
    throw new tools.ArgumentError('Must provide a valid domain');
  }

  if (typeof options.domain !== 'string' || options.domain.length === 0) {
    throw new tools.ArgumentError('The provided domain is invalid: ' + options.domain);
  }

  if (options.clientId === null || options.clientId === undefined) {
    throw new tools.ArgumentError('Must provide a valid clientId');
  }

  if (typeof options.clientId !== 'string' || options.clientId.length === 0) {
    throw new tools.ArgumentError('The provided clientId is invalid: ' + options.clientId);
  }

  if (options.clientSecret === null || options.clientSecret === undefined) {
    throw new tools.ArgumentError('Must provide a valid clientSecret');
  }

  if (typeof options.clientSecret !== 'string' || options.clientSecret.length === 0) {
    throw new tools.ArgumentError('The provided clientSecret is invalid: ' + options.clientSecret);
  }

  this.options = options;
  this.tokenCache = options.tokenCache || {
    getToken: function () {
      return Promise.resolve();
    },
    setToken: function () {
      return Promise.resolve();
    }
  };
}

LogsApiClient.prototype.getAccessToken = function () {
  var self = this;
  return new Promise(function (resolve, reject) {
    request.post('https://' + self.options.domain + '/oauth/token').send({
      audience: 'https://' + self.options.domain + '/api/v2/',
      client_id: self.options.clientId,
      client_secret: self.options.clientSecret,
      grant_type: 'client_credentials'
    }).set('Accept', 'application/json').end(function (err, res) {
      if (err && err.status === 401) {
        return reject(new tools.ManagementApiError('unauthorized', 'Invalid credentials for ' + self.options.clientId, err.status));
      } else if (err && res && res.body && res.body.error) {
        return reject(new tools.ManagementApiError(res.body.error, res.body.error_description || res.body.error, err.status));
      } else if (err) {
        return reject(err);
      }

      if (!res.ok || !res.body.access_token) {
        return reject(new tools.ManagementApiError('unknown_error', 'Unknown error from Management API or no access_token was provided: ' + (res.text || res.status)));
      }

      const expiresAt = new Date();
      return resolve({
        token: res.body.access_token,
        expiresAt: expiresAt.setSeconds(expiresAt.getSeconds() + res.body.expires_in)
      });
    });
  });
};

LogsApiClient.prototype.getAccessTokenCached = function () {
  var self = this;
  return self.tokenCache.getToken().then(function (cached) {
    if (cached && cached.token) {
      const now = new Date().valueOf();
      if (cached.expiresAt - now > 10000) {
        return cached;
      }
    }

    return self.getAccessToken(self.options).then(function (res) {
      return self.tokenCache.setToken(res).then(function () {
        return res;
      });
    });
  });
};

LogsApiClient.prototype.getLogs = function (params) {
  const self = this;
  return new Promise(function (resolve, reject) {
    self.getAccessTokenCached(self.options, self.storage).then(function (data) {
      const query = querystring.stringify(params);
      request.get('https://' + self.options.domain + '/api/v2/logs?' + query).set('Authorization', 'Bearer ' + data.token).set('Content-Type', 'application/json').end(function (err, res) {
        if (err && err.status === 403) {
          const returnError = function () {
            return reject(new tools.ManagementApiError(res.body.error, res.body.error_description || res.body.error, err.status));
          };

          // Clear the cached token.
          self.tokenCache.setToken(null).then(returnError).catch(returnError);
        }

        if (err && res && res.body && res.body.error) {
          return reject(new tools.ManagementApiError(res.body.error, res.body.error_description || res.body.error, err.status));
        }

        if (err) {
          return reject(err);
        }

        if (!res.ok) {
          return reject(new tools.ManagementApiError('unknown_error', 'Unknown error from Management API: ' + (res.text || res.status)));
        }

        return resolve({
          logs: res.body,
          limits: {
            limit: res.headers['x-ratelimit-limit'],
            remaining: res.headers['x-ratelimit-remaining'],
            reset: res.headers['x-ratelimit-reset']
          }
        });
      });
    });
  });
};

module.exports = LogsApiClient;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

const SlackReporter = __webpack_require__(16);

module.exports.LogsProcessor = __webpack_require__(15);

module.exports.LogsApiClient = __webpack_require__(7);

module.exports.LogsApiStream = __webpack_require__(10);

module.exports.logTypes = __webpack_require__(9);

module.exports.reporters = {
  SlackReporter: SlackReporter
};

/***/ }),
/* 9 */
/***/ (function(module, exports) {

const sev = { success: 'success', error: 'error', warning: 'warning' };
const logTypes = {
  s: {
    name: 'Success Login',
    icon: 'icon-budicon-448',
    severity: sev.success,
    level: 1
  },
  ssa: {
    name: 'Success Silent Auth',
    icon: 'icon-budicon-448',
    severity: sev.success,
    level: 1
  },
  fsa: {
    name: 'Failed Silent Auth',
    icon: 'icon-budicon-448',
    severity: sev.error,
    level: 3
  },
  seacft: {
    name: 'Success Exchange',
    description: 'Authorization Code for Access Token',
    icon: 'icon-budicon-456',
    severity: sev.success,
    level: 1
  },
  feacft: {
    name: 'Failed Exchange',
    description: 'Authorization Code for Access Token',
    icon: 'icon-budicon-456',
    severity: sev.error,
    level: 3
  },
  seccft: {
    name: 'Success Exchange',
    description: 'Client Credentials for Access Token',
    icon: 'icon-budicon-456',
    severity: sev.success,
    level: 1
  },
  feccft: {
    name: 'Failed Exchange',
    description: 'Client Credentials for Access Token',
    icon: 'icon-budicon-456',
    severity: sev.error,
    level: 3
  },
  sepft: {
    name: 'Success Exchange',
    description: 'Password for Access Token',
    icon: 'icon-budicon-456',
    severity: sev.success,
    level: 1
  },
  fepft: {
    name: 'Failed Exchange',
    description: 'Password for Access Token',
    icon: 'icon-budicon-456',
    severity: sev.error,
    level: 3
  },
  sertft: {
    name: 'Success Exchange',
    description: 'Refresh Token for Access Token',
    icon: 'icon-budicon-456',
    severity: sev.success,
    level: 1
  },
  fertft: {
    name: 'Failed Exchange',
    description: 'Refresh Token for Access Token',
    icon: 'icon-budicon-456',
    severity: sev.error,
    level: 3
  },
  seoobft: {
    name: 'Success Exchange',
    description: 'Password and OOB Challenge for Access Token',
    icon: 'icon-budicon-456',
    severity: sev.success,
    level: 1
  },
  feoobft: {
    name: 'Failed Exchange',
    description: 'Password and OOB Challenge for Access Token',
    icon: 'icon-budicon-456',
    severity: sev.error,
    level: 3
  },
  seotpft: {
    name: 'Success Exchange',
    description: 'Password and OTP Challenge for Access Token',
    icon: 'icon-budicon-456',
    severity: sev.success,
    level: 1
  },
  feotpft: {
    name: 'Failed Exchange',
    description: 'Password and OTP Challenge for Access Token',
    icon: 'icon-budicon-456',
    severity: sev.error,
    level: 3
  },
  sercft: {
    name: 'Success Exchange',
    description: 'Password and MFA Recovery code for Access Token',
    icon: 'icon-budicon-456',
    severity: sev.success,
    level: 1
  },
  fercft: {
    name: 'Failed Exchange',
    description: 'Password and MFA Recovery code for Access Token',
    icon: 'icon-budicon-456',
    severity: sev.error,
    level: 3
  },
  f: {
    name: 'Failed Login',
    icon: 'icon-budicon-448',
    severity: sev.error,
    level: 3
  },
  w: {
    name: 'Warning',
    icon: 'icon-budicon-354',
    severity: sev.warning,
    level: 2
  },
  depnote: {
    name: 'Deprecation Notice',
    icon: 'icon-budicon-354',
    severity: sev.warning,
    level: 2
  },
  du: {
    name: 'Deleted User',
    icon: 'icon-budicon-311',
    severity: sev.error,
    level: 3
  },
  fu: {
    name: 'Failed Login (invalid email/username)',
    icon: 'icon-budicon-311',
    severity: sev.error,
    level: 3
  },
  fp: {
    name: 'Failed Login (wrong password)',
    icon: 'icon-budicon-311',
    severity: sev.error,
    level: 3
  },
  fc: {
    name: 'Failed by Connector',
    icon: 'icon-budicon-313',
    severity: sev.error,
    level: 3
  },
  fco: {
    name: 'Failed by CORS',
    icon: 'icon-budicon-313',
    severity: sev.error,
    level: 3
  },
  con: {
    name: 'Connector Online',
    icon: 'icon-budicon-143',
    severity: sev.success,
    level: 1
  },
  coff: {
    name: 'Connector Offline',
    icon: 'icon-budicon-143',
    severity: sev.error,
    level: 3
  },
  fcpro: {
    name: 'Failed Connector Provisioning',
    icon: 'icon-budicon-143',
    severity: sev.error,
    level: 4
  },
  ss: {
    name: 'Success Signup',
    icon: 'icon-budicon-314',
    severity: sev.success,
    level: 1
  },
  fs: {
    name: 'Failed Signup',
    icon: 'icon-budicon-311',
    severity: sev.error,
    level: 3
  },
  cs: {
    name: 'Code Sent',
    icon: 'icon-budicon-243',
    severity: sev.success,
    level: 1
  },
  cls: {
    name: 'Code/Link Sent',
    icon: 'icon-budicon-781',
    severity: sev.success,
    level: 1
  },
  sv: {
    name: 'Success Verification Email',
    icon: 'icon-budicon-781',
    severity: sev.success,
    level: 1
  },
  fv: {
    name: 'Failed Verification Email',
    icon: 'icon-budicon-311',
    severity: sev.error,
    level: 3
  },
  scp: {
    name: 'Success Change Password',
    icon: 'icon-budicon-280',
    severity: sev.success,
    level: 1
  },
  fcp: {
    name: 'Failed Change Password',
    icon: 'icon-budicon-266',
    severity: sev.error,
    level: 3
  },
  scph: {
    name: 'Success Post Change Password Hook',
    icon: 'icon-budicon-280',
    severity: sev.success,
    level: 1
  },
  fcph: {
    name: 'Failed Post Change Password Hook',
    icon: 'icon-budicon-266',
    severity: sev.error,
    level: 3
  },
  sce: {
    name: 'Success Change Email',
    icon: 'icon-budicon-266',
    severity: sev.success,
    level: 1
  },
  fce: {
    name: 'Failed Change Email',
    icon: 'icon-budicon-266',
    severity: sev.error,
    level: 3
  },
  scu: {
    name: 'Success Change Username',
    icon: 'icon-budicon-266',
    severity: sev.success,
    level: 1
  },
  fcu: {
    name: 'Failed Change Username',
    icon: 'icon-budicon-266',
    severity: sev.error,
    level: 3
  },
  scpn: {
    name: 'Success Change Phone Number',
    icon: 'icon-budicon-266',
    severity: sev.success,
    level: 1
  },
  fcpn: {
    name: 'Failed Change Phone Number',
    icon: 'icon-budicon-266',
    severity: sev.error,
    level: 3
  },
  svr: {
    name: 'Success Verification Email Request',
    icon: 'icon-budicon-781',
    severity: sev.success,
    level: 1
  },
  fvr: {
    name: 'Failed Verification Email Request',
    icon: 'icon-budicon-311',
    severity: sev.error,
    level: 3
  },
  scpr: {
    name: 'Success Change Password Request',
    icon: 'icon-budicon-280',
    severity: sev.success,
    level: 1
  },
  fcpr: {
    name: 'Failed Change Password Request',
    icon: 'icon-budicon-311',
    severity: sev.error,
    level: 3
  },
  fn: {
    name: 'Failed Sending Notification',
    icon: 'icon-budicon-782',
    severity: sev.error,
    level: 3
  },
  sapi: {
    name: 'API Operation',
    icon: 'icon-budicon-546',
    severity: sev.success,
    level: 1,
    category: 'api'
  },
  fapi: {
    name: 'Failed API Operation',
    icon: 'icon-budicon-546',
    severity: sev.error,
    level: 3,
    category: 'api'
  },
  limit_wc: {
    name: 'Blocked Account',
    icon: 'icon-budicon-313',
    severity: sev.error,
    level: 4
  },
  limit_mu: {
    name: 'Blocked IP Address',
    icon: 'icon-budicon-313',
    severity: sev.error,
    level: 4
  },
  limit_ui: {
    name: 'Too Many Calls to /userinfo',
    icon: 'icon-budicon-313',
    severity: sev.error,
    level: 4
  },
  api_limit: {
    name: 'Rate Limit On API',
    icon: 'icon-budicon-313',
    severity: sev.error,
    level: 4
  },
  limit_delegation: {
    name: 'Too Many Calls to /delegation',
    icon: 'icon-budicon-313',
    severity: sev.error,
    level: 4
  },
  sdu: {
    name: 'Successful User Deletion',
    icon: 'icon-budicon-312',
    severity: sev.success,
    level: 1
  },
  fdu: {
    name: 'Failed User Deletion',
    icon: 'icon-budicon-311',
    severity: sev.error,
    level: 3
  },
  admin_update_launch: {
    name: 'Auth0 Update Launched',
    icon: 'icon-budicon-774',
    severity: sev.success,
    level: 1
  },
  sys_os_update_start: {
    name: 'Auth0 OS Update Started',
    icon: 'icon-budicon-661',
    severity: sev.success,
    level: 1
  },
  sys_os_update_end: {
    name: 'Auth0 OS Update Ended',
    icon: 'icon-budicon-661',
    severity: sev.success,
    level: 1
  },
  sys_update_start: {
    name: 'Auth0 Update Started',
    icon: 'icon-budicon-661',
    severity: sev.success,
    level: 1
  },
  sys_update_end: {
    name: 'Auth0 Update Ended',
    icon: 'icon-budicon-661',
    severity: sev.success,
    level: 1
  },
  slo: {
    name: 'Success Logout',
    icon: 'icon-budicon-449',
    severity: sev.success,
    level: 1
  },
  flo: {
    name: 'Failed Logout',
    icon: 'icon-budicon-449',
    severity: sev.error,
    level: 3
  },
  sd: {
    name: 'Success Delegation',
    icon: 'icon-budicon-456',
    severity: sev.success,
    level: 1
  },
  fd: {
    name: 'Failed Delegation',
    icon: 'icon-budicon-456',
    severity: sev.error,
    level: 3
  },
  gd_unenroll: {
    name: 'Unenroll device account',
    icon: 'icon-budicon-298',
    severity: sev.success,
    level: 1
  },
  gd_update_device_account: {
    name: 'Update device account',
    icon: 'icon-budicon-257',
    severity: sev.success,
    level: 1
  },
  gd_module_switch: {
    name: 'Module switch',
    icon: 'icon-budicon-329',
    severity: sev.success,
    level: 1
  },
  gd_tenant_update: {
    name: 'Guardian tenant update',
    icon: 'icon-budicon-170',
    severity: sev.success,
    level: 1
  },
  gd_start_auth: {
    name: 'Second factor started',
    icon: 'icon-budicon-285',
    severity: sev.success,
    level: 1
  },
  gd_start_enroll: {
    name: 'Enroll started',
    icon: 'icon-budicon-299',
    severity: sev.success,
    level: 1
  },
  gd_start_enroll_failed: {
    name: 'MFA Enrollment start failed',
    icon: 'icon-budicon-299',
    severity: sev.error,
    level: 3
  },
  gd_user_delete: {
    name: 'User delete',
    icon: 'icon-budicon-298',
    severity: sev.success,
    level: 1
  },
  gd_auth_succeed: {
    name: 'OTP Auth suceed',
    icon: 'icon-budicon-mfa-login-succeed',
    severity: sev.success,
    level: 1
  },
  gd_auth_failed: {
    name: 'OTP Auth failed',
    icon: 'icon-budicon-mfa-login-failed',
    severity: sev.error,
    level: 3
  },
  gd_send_pn: {
    name: 'Push notification sent',
    icon: 'icon-budicon-mfa-send-pn',
    severity: sev.success,
    level: 1
  },
  gd_send_pn_failure: {
    name: 'Error sending MFA Push Notification',
    icon: 'icon-budicon-mfa-send-pn',
    severity: sev.error,
    level: 3
  },
  gd_auth_rejected: {
    name: 'OTP Auth rejected',
    icon: 'icon-budicon-mfa-login-failed',
    severity: sev.error,
    level: 3
  },
  gd_recovery_succeed: {
    name: 'Recovery succeed',
    icon: 'icon-budicon-mfa-recovery-succeed',
    severity: sev.success,
    level: 1
  },
  gd_recovery_failed: {
    name: 'Recovery failed',
    icon: 'icon-budicon-mfa-recovery-failed',
    severity: sev.error,
    level: 3
  },
  gd_send_sms: {
    name: 'SMS Sent',
    icon: 'icon-budicon-799',
    severity: sev.success,
    level: 1
  },
  gd_send_sms_failure: {
    name: 'Error sending MFA SMS',
    icon: 'icon-budicon-799',
    severity: sev.error,
    level: 3
  },
  gd_otp_rate_limit_exceed: {
    name: 'Too many failures',
    icon: 'icon-budicon-435',
    severity: sev.warning,
    level: 2
  },
  gd_recovery_rate_limit_exceed: {
    name: 'Too many failures',
    icon: 'icon-budicon-435',
    severity: sev.warning,
    level: 2
  },
  gd_enrollment_complete: {
    name: 'Guardian enrollment complete',
    icon: 'icon-budicon-299',
    severity: sev.success,
    level: 1
  },
  fui: {
    name: 'Users import',
    icon: 'icon-budicon-299',
    severity: sev.warning,
    level: 2
  },
  sui: {
    name: 'Users import',
    icon: 'icon-budicon-299',
    severity: sev.success,
    level: 1
  },
  pwd_leak: {
    name: 'Breached password',
    icon: 'icon-budicon-313',
    severity: sev.error,
    level: 3
  },
  fcoa: {
    name: 'Failed cross origin authentication',
    icon: 'icon-budicon-448',
    severity: sev.error,
    level: 3
  },
  scoa: {
    name: 'Success cross origin authentication',
    icon: 'icon-budicon-448',
    severity: sev.success,
    level: 1
  },
  ublkdu: {
    name: 'Account unblocked',
    icon: 'icon-budicon-313',
    severity: sev.success,
    level: 1
  },
  sens: {
    name: 'Success Exchange',
    icon: 'icon-budicon-448',
    severity: sev.success,
    level: 1
  },
  fens: {
    name: 'Failed Exchange',
    icon: 'icon-budicon-448',
    severity: sev.error,
    level: 3
  }
};

module.exports = logTypes;
module.exports.get = function (type) {
  return logTypes[type] && logTypes[type].name || 'Unknown Log Type: ' + type;
};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

const util = __webpack_require__(34);
const Readable = __webpack_require__(33).Readable;
const tools = __webpack_require__(1);

const LogsApiClient = __webpack_require__(7);

const MS_PER_S = 1000;
const NS_PER_MS = 1000000;

function LogsApiStream(options) {
  if (options === null || options === undefined) {
    throw new tools.ArgumentError('Must provide an options object');
  }

  Readable.call(this, { objectMode: true });

  this.client = new LogsApiClient(options);
  this.options = options;
  this.remaining = 50;
  this.lastBatch = 0;
  this.retries = 0;
  this.previousCheckpoint = options.checkpointId || null;
  this.lastCheckpoint = options.checkpointId || null;
  this.status = {
    startCheckpoint: options.checkpointId || null,
    start: new Date(),
    end: null,
    logsProcessed: 0
  };
}

util.inherits(LogsApiStream, Readable);

LogsApiStream.prototype.getQuery = function (types) {
  if (!types || !types.length) {
    return '';
  }

  return 'type:' + types.join(' OR type:');
};

LogsApiStream.prototype.done = function () {
  this.status.end = new Date();
  this.push(null);
};

LogsApiStream.prototype.next = function (take) {
  const self = this;
  const logger = this.options.logger;
  const perPage = take;

  if (self.remaining < 1) {
    self.status.warning = 'Auth0 Management API rate limit reached.';
    self.done();
  } else {
    const params = self.lastCheckpoint ? { take: perPage, from: self.lastCheckpoint } : { per_page: perPage, page: 0 };
    params.q = self.getQuery(self.options.types);
    params.sort = 'date:1';

    if (logger) {
      const startPoint = params.from ? `checkpoint ${params.from}` : `page ${params.page}`;
      logger.debug(`Requesting logs from ${startPoint}`);
    }

    const startTime = process.hrtime();
    const getLogs = function () {
      self.client.getLogs(params).then(function (data) {
        const elapsedTime = process.hrtime(startTime);
        const elapsedMillis = elapsedTime[0] * MS_PER_S + elapsedTime[1] / NS_PER_MS;

        if (logger) {
          logger.debug(`Retrieved logs in ${elapsedMillis}ms.`);
        }

        const logs = data.logs;
        self.remaining = data.limits.remaining;

        if (logs && logs.length) {
          var filtered = logs;
          if (self.options.types && self.options.types.length) {
            filtered = logs.filter(function (log) {
              return self.options.types.indexOf(log.type) >= 0;
            }).slice(0, take || 100);
          }

          if (filtered.length) {
            self.lastCheckpoint = filtered[filtered.length - 1]._id;
            self.lastBatch += filtered.length;
            self.push({ logs: filtered, limits: data.limits });
          } else {
            self.lastCheckpoint = logs[logs.length - 1]._id;
            self.lastBatch += 0;
            self.push({ logs: [], limits: data.limits });
          }
        } else {
          self.status.end = new Date();
          self.push(null);
        }

        return logs;
      }).catch(function (err) {
        const start = self.options.start;
        const limit = self.options.maxRunTimeSeconds;
        const now = new Date().getTime();
        const hasTime = start + limit * 1000 >= now;

        if (self.options.maxRetries > self.retries && hasTime) {
          self.retries++;
          return getLogs();
        }

        return self.emit('error', err);
      });
    };

    getLogs();
  }
};

LogsApiStream.prototype.batchSaved = function () {
  this.status.logsProcessed += this.lastBatch;
  this.previousCheckpoint = this.lastCheckpoint;
  this.lastBatch = 0;
};

LogsApiStream.prototype._read = function read() {};

module.exports = LogsApiStream;

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("superagent@1.2.0");

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(__dirname) {const url = __webpack_require__(13);
const path = __webpack_require__(11);
const morgan = __webpack_require__(30);
const Express = __webpack_require__(4);
const bodyParser = __webpack_require__(26);
const tools = __webpack_require__(1);
const expressTools = __webpack_require__(3);

const routes = __webpack_require__(22);
const meta = __webpack_require__(23);
const hooks = __webpack_require__(20);
const logger = __webpack_require__(2);
const config = __webpack_require__(0);
const processLogs = __webpack_require__(18);

module.exports = (configProvider, storageProvider) => {
  config.setProvider(configProvider);

  const storage = storageProvider ? new tools.WebtaskStorageContext(storageProvider, { force: 1 }) : new tools.FileStorageContext(path.join(__dirname, './data.json'), { mergeWrites: true });

  const app = new Express();
  app.use(morgan(':method :url :status :response-time ms - :res[content-length]', {
    stream: logger.stream
  }));

  const prepareBody = middleware => (req, res, next) => {
    if (req.webtaskContext && req.webtaskContext.body) {
      req.body = req.webtaskContext.body;
      return next();
    }

    return middleware(req, res, next);
  };

  app.use(prepareBody(bodyParser.json()));
  app.use(prepareBody(bodyParser.urlencoded({ extended: false })));

  // Configure routes.
  app.use(expressTools.routes.dashboardAdmins({
    secret: config('EXTENSION_SECRET'),
    audience: 'urn:logs-to-provider',
    rta: config('AUTH0_RTA').replace('https://', ''),
    domain: config('AUTH0_DOMAIN'),
    baseUrl: config('PUBLIC_WT_URL') || config('WT_URL'),
    clientName: 'Logs to Any Provider',
    urlPrefix: '',
    sessionStorageKey: 'logs-to-provider:apiToken'
  }));
  app.use('/meta', meta());
  app.use('/.extensions', hooks());

  app.use('/app', Express.static(path.join(__dirname, '../dist')));

  app.use(processLogs(storage));
  app.use('/', routes(storage));

  // Generic error handler.
  app.use(expressTools.middlewares.errorHandler(logger.error.bind(logger)));
  return app;
};
/* WEBPACK VAR INJECTION */}.call(exports, "/"))

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const _ = __webpack_require__(5);
const Promise = __webpack_require__(6);
const tools = __webpack_require__(1);

const logTypes = __webpack_require__(9);
const LogsApiStream = __webpack_require__(10);
const StorageProvider = __webpack_require__(17);

function LogsProcessor(storageContext, options) {
  if (options === null || options === undefined) {
    throw new tools.ArgumentError('Must provide an options object');
  }

  this.start = new Date().getTime();
  this.storage = new StorageProvider(storageContext);
  this.options = _.assign({}, {
    batchSize: 100,
    maxRetries: 5,
    maxRunTimeSeconds: 22
  }, options);
}

LogsProcessor.prototype.hasTimeLeft = function (start, responseCount) {
  const now = new Date().getTime();
  const averageTime = (now - start) / responseCount;
  const limit = this.options.maxRunTimeSeconds;
  const timeLeft = start + limit * 1000 - now;

  if (this.options.logger) {
    this.options.logger.debug(`${timeLeft / 1000} seconds run time left, average response time is ${averageTime / 1000} seconds.`);
  }

  return timeLeft >= averageTime;
};

LogsProcessor.prototype.getLogFilter = function (options) {
  var types = options.logTypes || [];
  if (options.logLevel) {
    const typesFromLevel = _.map(logTypes, (data, type) => {
      const logType = data;
      logType.type = type;
      return logType;
    });

    types = types.concat(_.map(_.filter(typesFromLevel, type => type.level >= options.logLevel), 'type'));
  }

  return _.uniq(types);
};

LogsProcessor.prototype.getReport = function (start, end) {
  const startStamp = new Date(start).getTime();
  const endStamp = end ? new Date(end).getTime() : new Date().getTime();

  return this.storage.read().then(data => _.filter(data.logs, log => {
    const logStart = new Date(log.start).getTime();
    const logEnd = new Date(log.end).getTime();

    return logStart >= startStamp && logEnd <= endStamp;
  })).then(logs => {
    const result = {
      type: 'report',
      processed: 0,
      warnings: 0,
      errors: 0,
      checkpoint: ''
    };

    _.each(logs, log => {
      result.processed += log.logsProcessed;
      result.checkpoint = log.checkpoint;

      if (log.error) {
        result.errors += 1;
      }

      if (log.warning) {
        result.warnings += 1;
      }
    });

    return result;
  });
};

LogsProcessor.prototype.createStream = function (options) {
  return this.storage.getCheckpoint(options.startFrom).then(startCheckpoint => {
    if (options.logger) {
      options.logger.debug('Starting logs processor from checkpoint:', startCheckpoint);
    }

    return new LogsApiStream({
      checkpointId: startCheckpoint,
      types: this.getLogFilter(options),
      start: this.start,
      maxRetries: options.maxRetries,
      maxRunTimeSeconds: options.maxRunTimeSeconds,
      domain: options.domain,
      clientId: options.clientId,
      clientSecret: options.clientSecret,
      tokenCache: this.storage,
      logger: options.logger
    });
  });
};

LogsProcessor.prototype.run = function (handler) {
  const handlerAsync = Promise.promisify(handler);

  return new Promise((resolve, reject) => {
    const start = this.start;
    let responseCount = 0;
    let retries = 0;
    let lastLogDate = 0;
    let logsBatch = [];
    const storage = this.storage;
    const options = this.options;
    const batchSize = options.batchSize;
    const maxRetries = options.maxRetries;

    // Stop the run because it failed.
    const runFailed = (error, status, checkpoint) => {
      if (options.logger) {
        options.logger.debug('Processor failed:', error);
      }

      status.error = error;

      storage.done(status, checkpoint).then(() => resolve({ status: status, checkpoint: checkpoint })).catch(reject);
    };

    // The run ended successfully.
    const runSuccess = (status, checkpoint) => {
      if (options.logger) {
        options.logger.debug('Processor run complete. Logs processed:', status.logsProcessed);
      }

      if (checkpoint !== status.startCheckpoint) {
        const week = 604800000;
        const currentDate = new Date().getTime();
        const timeDiff = currentDate - lastLogDate;

        if (timeDiff >= week) {
          status.warning = 'Logs are outdated more than for week. Last processed log has date is ' + new Date(lastLogDate);
        }

        return storage.done(status, checkpoint).then(() => resolve({ status: status, checkpoint: checkpoint })).catch(reject);
      }

      return resolve({ status: status, checkpoint: checkpoint });
    };

    // Figure out how big we want the batch of logs to be.
    const getNextLimit = () => {
      var limit = batchSize;
      limit -= logsBatch.length;
      if (limit > 1000) {
        limit = 1000;
      }
      return limit;
    };

    // Retry the process if it failed.
    const retryProcess = (err, stream) => {
      if (!this.hasTimeLeft(start, responseCount)) {
        return Promise.reject({
          err,
          status: stream.status,
          checkpoint: stream.previousCheckpoint,
          unrecoverable: true
        });
      }

      if (retries < maxRetries) {
        retries += 1;
        return handlerAsync(logsBatch);
      }

      const error = [err, 'Skipping logs from ' + stream.previousCheckpoint + ' to ' + stream.lastCheckpoint + ' after ' + maxRetries + ' retries.'];

      if (options.logger) {
        options.logger.error(error[0] && error[0].message || error[0], error[1]);
      }

      // We're giving up.
      return Promise.reject({
        err: error,
        status: stream.status,
        checkpoint: stream.lastCheckpoint,
        unrecoverable: true
      });
    };

    this.createStream(options).then(stream => new Promise((streamResolve, streamReject) => {
      const nextLimit = getNextLimit();
      let timedOut = false;

      if (options.logger) {
        options.logger.debug('Loading next batch of logs. Next limit:', nextLimit);
      }

      // Get the first batch.
      stream.next(nextLimit);

      // Process batch of logs.
      stream.on('data', data => {
        const logs = data.logs;
        logsBatch = logsBatch.concat(logs);

        responseCount++;

        if (logs && logs.length) {
          lastLogDate = new Date(logs[logs.length - 1].date).getTime();
        }

        // TODO: At some point, even if the batch is too small, we need to ship the logs.
        if (logsBatch.length < batchSize && this.hasTimeLeft(start, responseCount)) {
          return stream.next(getNextLimit());
        }

        const processComplete = err => {
          if (err) {
            if (err.unrecoverable) {
              return streamReject(err);
            }

            return retryProcess(err.err || err, stream).then(() => processComplete()).catch(err => processComplete(err));
          }

          logsBatch = [];

          if (!this.hasTimeLeft(start, responseCount)) {
            if (options.logger) {
              options.logger.debug('No time left for additional requests');
            }

            return stream.done();
          }

          stream.batchSaved();
          return stream.next(getNextLimit());
        };

        return handlerAsync(logsBatch).then(() => processComplete()).catch(err => processComplete(err));
      });

      const handleEnd = () => {
        const processComplete = err => {
          if (err) {
            if (err.unrecoverable) {
              return streamReject(err);
            }

            return retryProcess(err.err || err, stream).then(() => processComplete()).catch(err => processComplete(err));
          }

          stream.batchSaved();
          return streamResolve({
            status: stream.status,
            checkpoint: stream.lastCheckpoint
          });
        };

        return handlerAsync(logsBatch).then(() => processComplete()).catch(err => processComplete(err));
      };

      new Promise(endResolve => {
        stream.on('end', endResolve);
      }).then(handleEnd);

      // An error occured when processing the stream.
      stream.on('error', err => streamReject({
        err,
        status: stream.status,
        checkpoint: stream.previousCheckpoint
      }));
    })).then(result => runSuccess(result.status, result.checkpoint)).catch(result => runFailed(result.err, result.status, result.checkpoint));
  });
};

module.exports = LogsProcessor;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

const Promise = __webpack_require__(6);
const request = __webpack_require__(12);

function SlackReporter(options) {
  this.options = options || {};
}

SlackReporter.prototype.send = function (status, checkpoint) {
  if (!status || typeof status !== 'object') {
    throw new Error('object status is required');
  }

  const options = this.options;
  const msg = this.createMessage(this.options, status, checkpoint);

  return new Promise(function (resolve, reject) {
    if (!options.hook) {
      return resolve();
    }

    return request.post(options.hook).send(msg).set('Accept', 'application/json').end(function (err) {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
};

SlackReporter.prototype.createMessage = function (options, status, checkpoint) {
  const msg = {
    username: options.username || 'auth0-logger',
    icon_emoji: options.icon || ':rocket:',
    attachments: []
  };

  const title = options.title || 'Auth0 Logger';
  const defaultText = status.type === 'report' ? title + ' Daily Report' : status.error ? title + ' Error' : title + ' Success';
  const error = status.error || null;

  const defaultTemplate = {
    fallback: options.fallback || defaultText,
    text: options.text || defaultText,
    error_field: { title: 'Error', value: JSON.stringify(error), short: false }
  };

  if (status.type === 'report') {
    defaultTemplate.fields = [{ title: 'Logs processed', value: status.processed, short: true }, { title: 'Warnings', value: status.warnings, short: true }, { title: 'Errors', value: status.errors, short: true }, { title: 'Next checkpoint', value: status.checkpoint, short: true }];
  } else {
    defaultTemplate.fields = [{ title: 'Start time', value: status.start, short: true }, { title: 'End time', value: status.end, short: true }, { title: 'Logs processed', value: status.logsProcessed, short: true }, { title: 'Next checkpoint', value: checkpoint, short: true }];
  }

  const details = options.url ? ' (<' + options.url + '|Details>)' : null;

  const fields = defaultTemplate.fields;

  if (status.error) {
    fields.push(defaultTemplate.error_field);
  }

  // Todo: this should handle error colors/warning colors also.
  msg.attachments.push({
    color: status.error ? '#d13f42' : '#7cd197',
    fallback: defaultTemplate.fallback,
    text: defaultTemplate.fallback + (details || ''),
    fields: fields
  });

  return msg;
};

module.exports = SlackReporter;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

const assign = __webpack_require__(5).assign;
const ArgumentError = __webpack_require__(1).ArgumentError;

function StorageProvider(storageContext, options) {
  if (!storageContext) {
    throw new ArgumentError('The storageContext is required');
  }

  this.storageContext = storageContext;
  this.options = assign({}, { limit: 400 }, options);
}

StorageProvider.prototype.read = function () {
  const self = this;
  return self.storageContext.read().then(function (contents) {
    const data = contents || {};
    data.logs = data.logs || [];
    return data;
  });
};

StorageProvider.prototype.write = function (data) {
  const self = this;
  return self.storageContext.write(data);
};

StorageProvider.prototype.getCheckpoint = function (startFrom) {
  const self = this;
  return self.read().then(function (data) {
    if (startFrom && startFrom !== data.startFrom) {
      data.startFrom = startFrom;
      data.checkpointId = startFrom;

      return self.write(data).then(function () {
        return data.checkpointId || startFrom || null;
      });
    }

    return data.checkpointId;
  });
};

StorageProvider.prototype.getToken = function () {
  return this.read().then(function (data) {
    return data.logs_access_token || null;
  });
};

StorageProvider.prototype.setToken = function (token) {
  const self = this;
  return self.read().then(function (data) {
    data.logs_access_token = token;
    return self.write(data);
  });
};

StorageProvider.prototype.done = function (status, checkpointId) {
  const self = this;
  return self.read().then(function (data) {
    const storageSize = Buffer.byteLength(JSON.stringify(data), 'utf8');
    if (storageSize >= self.options.limit * 1024 && data.logs && data.logs.length) {
      data.logs.splice(0, 5);
    }

    status.checkpoint = checkpointId;

    data.logs.push(status);
    data.checkpointId = checkpointId;

    return self.write(data);
  });
};

module.exports = StorageProvider;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

const moment = __webpack_require__(29);
const loggingTools = __webpack_require__(8);

const logger = __webpack_require__(2);
const config = __webpack_require__(0);
const sender = __webpack_require__(19);

const MS_PER_S = 1000;
const NS_PER_MS = 1000000;

module.exports = storage => (req, res, next) => {
  const wtBody = req.webtaskContext && req.webtaskContext.body || req.body || {};
  const wtHead = req.webtaskContext && req.webtaskContext.headers || {};
  const isCron = wtBody.schedule && wtBody.state === 'active' || wtHead.referer === 'https://manage.auth0.com/' && wtHead['if-none-match'];

  if (!isCron) {
    return next();
  }

  const sendLogs = sender();

  const updateLastRun = () => storage.read().then(data => {
    data.lastRun = new Date();
    return storage.write(data);
  });

  const provider = "newrelic-logs";

  const onLogsReceived = (logs, callback) => {
    const startTime = process.hrtime();

    const requestFinished = err => {
      const elapsedTime = process.hrtime(startTime);
      const elapsedMillis = elapsedTime[0] * MS_PER_S + elapsedTime[1] / NS_PER_MS;

      logger.info(`Finished request to '${provider}' in ${elapsedMillis}ms.`);

      callback(err);
    };

    sendLogs(logs, requestFinished);
  };

  const slackConfig = {
    hook: config('SLACK_INCOMING_WEBHOOK_URL'),
    username: `auth0-logs-to-${provider}`,
    title: 'Logs Export'
  };

  if (provider === 'mgmt-webhooks') {
    slackConfig.username = 'auth0-management-api-webhooks';
    slackConfig.title = 'Management API Webhooks';
  } else if (provider === 'auth-webhooks') {
    slackConfig.username = 'auth0-authentication-api-webhooks';
    slackConfig.title = 'Authentication API Webhooks';
  }

  const slack = new loggingTools.reporters.SlackReporter(slackConfig);

  const options = {
    domain: config('AUTH0_DOMAIN'),
    clientId: config('AUTH0_CLIENT_ID'),
    clientSecret: config('AUTH0_CLIENT_SECRET'),
    batchSize: parseInt(config('BATCH_SIZE')),
    startFrom: config('START_FROM'),
    logTypes: config('LOG_TYPES'),
    logLevel: config('LOG_LEVEL'),
    logger
  };

  let maxBatchSize = 100;

  if (provider === 'mixpanel') {
    maxBatchSize = 20;
  } else if (options.batchSize === 1000) {
    maxBatchSize = options.batchSize;
  }

  if (!options.batchSize || options.batchSize > maxBatchSize) {
    options.batchSize = maxBatchSize;
  }

  if (options.logTypes && !Array.isArray(options.logTypes)) {
    options.logTypes = options.logTypes.replace(/\s/g, '').split(',');
  }

  if (provider === 'mgmt-webhooks') {
    options.logTypes = ['sapi', 'fapi'];
  } else if (provider === 'segment') {
    options.logTypes = ['s', 'ss', 'f'];
  }

  const auth0logger = new loggingTools.LogsProcessor(storage, options);

  const sendDailyReport = lastReportDate => {
    const current = new Date();

    const end = current.getTime();
    const start = end - 86400000;
    auth0logger.getReport(start, end).then(report => slack.send(report, report.checkpoint)).then(() => storage.read()).then(data => {
      data.lastReportDate = lastReportDate;
      return storage.write(data);
    });
  };

  const checkReportTime = () => {
    storage.read().then(data => {
      const now = moment().format('DD-MM-YYYY');
      const reportTime = config('DAILY_REPORT_TIME') || 16;

      if (data.lastReportDate !== now && new Date().getHours() >= reportTime) {
        sendDailyReport(now);
      }
    });
  };

  return updateLastRun().then(() => auth0logger.run(onLogsReceived).then(result => {
    if (result && result.status && result.status.error) {
      slack.send(result.status, result.checkpoint);
    } else if (config('SLACK_SEND_SUCCESS') === true || config('SLACK_SEND_SUCCESS') === 'true') {
      slack.send(result.status, result.checkpoint);
    }
    checkReportTime();
    res.json(result);
  }).catch(err => {
    slack.send({ error: err, logsProcessed: 0 }, null);
    checkReportTime();
    next(err);
  }));
};

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

const _ = __webpack_require__(5);
const request = __webpack_require__(32);
const url = __webpack_require__(13);
const loggingTools = __webpack_require__(8);

const config = __webpack_require__(0);
const logger = __webpack_require__(2);

module.exports = () => {
  const sendLogs = (logs, callback) => {
    if (logs.length === 0) {
      callback();
    }

    try {
      request.post(config('NEWRELIC_HTTP_ENDPOINT')).send(logs.map(log => JSON.stringify(log)).join('\n')).set('Content-Type', 'application/json').set('X-License-Key', config('NEWRELIC_LICENSEKEY')).end(function (err, res) {
        if (err || res.statusCode < 200 || res.statusCode >= 400) {
          const error = res.error || err.response;
          const errText = error && error.text && error.text.replace(/<\/?[^>]+>/gi, '');

          return callback(errText || err || res.statusCode);
        }

        return callback();
      });
    } catch (e) {
      return callback(e);
    }
  };

  return (logs, callback) => {
    if (!logs || !logs.length) {
      return callback();
    }

    logger.info(`Sending ${logs.length} logs to New Relic Logs.`);

    const timestamp = new Date().toUTCString();
    const common = {
      "attributes": {
        "service": "auth0_logs",
        "hostname": config('AUTH0_DOMAIN')
      }
    };
    const body = [];
    const sendlogs = [];

    logs.forEach(log => {
      const data = {
        timestamp: timestamp,
        messages: log
      };

      sendlogs.push(data);
    });

    body.push(_.extend(common, sendlogs));

    return sendLogs(body, callback);
  };
};

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

const router = __webpack_require__(4).Router;
const middlewares = __webpack_require__(3).middlewares;

const config = __webpack_require__(0);
const logger = __webpack_require__(2);

module.exports = () => {
  const hooks = router();
  const hookValidator = middlewares.validateHookToken(config('AUTH0_DOMAIN'), config('WT_URL'), config('EXTENSION_SECRET'));

  hooks.use('/on-uninstall', hookValidator('/.extensions/on-uninstall'));
  hooks.use(middlewares.managementApiClient({
    domain: config('AUTH0_DOMAIN'),
    clientId: config('AUTH0_CLIENT_ID'),
    clientSecret: config('AUTH0_CLIENT_SECRET')
  }));

  hooks.delete('/on-uninstall', (req, res) => {
    const clientId = config('AUTH0_CLIENT_ID');
    req.auth0.clients.delete({ client_id: clientId }).then(() => {
      logger.debug(`Deleted client ${clientId}`);
      res.sendStatus(204);
    }).catch(err => {
      logger.debug(`Error deleting client: ${config('AUTH0_CLIENT_ID')}`);
      logger.error(err);

      // Even if deleting fails, we need to be able to uninstall the extension.
      res.sendStatus(204);
    });
  });
  return hooks;
};

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(__dirname) {const fs = __webpack_require__(28);
const ejs = __webpack_require__(27);
const path = __webpack_require__(11);
const urlHelpers = __webpack_require__(3).urlHelpers;

const config = __webpack_require__(0);

module.exports = () => {
  const template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <title><%= config.TITLE %></title>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="shortcut icon" href="https://cdn.auth0.com/styleguide/4.6.13/lib/logos/img/favicon.png">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" href="https://cdn.auth0.com/styles/zocial.min.css" />
    <link rel="stylesheet" type="text/css" href="https://cdn.auth0.com/manage/v0.3.1672/css/index.min.css" />
    <link rel="stylesheet" type="text/css" href="https://cdn.auth0.com/styleguide/4.6.13/index.min.css" />
    <% if (assets.style) { %><link rel="stylesheet" type="text/css" href="/app/<%= assets.style %>" /><% } %>
    <% if (assets.useCdn) { %><link rel="stylesheet" type="text/css" href="//cdn.auth0.com/extensions/auth0-logs-to-provider/assets/auth0-logs-to-provider.ui.css" /><% } %>
    <% if (assets.customCss) { %><link rel="stylesheet" type="text/css" href="<%= assets.customCss %>" /><% } %>
  </head>
  <body>
    <div id="app"></div>
    <script type="text/javascript" src="//cdn.auth0.com/w2/auth0-7.0.4.min.js"></script>
    <script type="text/javascript" src="//cdn.auth0.com/manage/v0.3.1672/js/bundle.js"></script>
    <script type="text/javascript">window.config = <%- JSON.stringify(config) %>;</script>
    <% if (assets.vendors) { %><script type="text/javascript" src="/app/<%= assets.vendors %>"></script><% } %>
    <% if (assets.app) { %><script type="text/javascript" src="<%= assets.app %>"></script><% } %>
    <% if (assets.useCdn) { %>
    <script type="text/javascript" src="//cdn.auth0.com/extensions/auth0-logs-to-provider/assets/auth0-logs-to-provider.ui.vendors.js"></script>
    <script type="text/javascript" src="//cdn.auth0.com/extensions/auth0-logs-to-provider/assets/auth0-logs-to-provider.ui.js"></script>
    <% } %>
  </body>
  </html>
  `;

  return (req, res, next) => {
    if (req.url.indexOf('/api') === 0) {
      return next();
    }

    const settings = {
      AUTH0_DOMAIN: config('AUTH0_DOMAIN'),
      AUTH0_CLIENT_ID: config('EXTENSION_CLIENT_ID'),
      AUTH0_MANAGE_URL: config('AUTH0_MANAGE_URL') || 'https://manage.auth0.com',
      BASE_URL: urlHelpers.getBaseUrl(req),
      BASE_PATH: urlHelpers.getBasePath(req),
      TITLE: config('TITLE')
    };

    // Render from CDN.
    if (true) {
      return res.send(ejs.render(template, {
        config: settings,
        assets: {
          customCss: config('CUSTOM_CSS'),
          useCdn: true
        }
      }));
    }

    // Render locally.
    return fs.readFile(path.join(__dirname, '../../dist/manifest.json'), 'utf8', (err, manifest) => {
      const locals = {
        config: settings,
        assets: {
          customCss: config('CUSTOM_CSS'),
          app: 'http://localhost:3000/app/bundle.js'
        }
      };

      if (!err && manifest) {
        locals.assets = JSON.parse(manifest);
        locals.assets.app = '/app/' + locals.assets.app;
        locals.assets.customCss = config('CUSTOM_CSS');
      }

      // Render the HTML page.
      res.send(ejs.render(template, locals));
    });
  };
};
/* WEBPACK VAR INJECTION */}.call(exports, "/"))

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

const _ = __webpack_require__(5);
const router = __webpack_require__(4).Router;
const middlewares = __webpack_require__(3).middlewares;

const config = __webpack_require__(0);
const htmlRoute = __webpack_require__(21);

module.exports = storage => {
  const app = router();
  const authenticateAdmins = middlewares.authenticateAdmins({
    credentialsRequired: true,
    secret: config('EXTENSION_SECRET'),
    audience: 'urn:logs-to-provider',
    baseUrl: config('PUBLIC_WT_URL') || config('WT_URL'),
    onLoginSuccess: (req, res, next) => next()
  });

  app.get('/', htmlRoute());

  app.get('/api/report', authenticateAdmins, (req, res, next) => storage.read().then(data => {
    const lastRun = data && data.lastRun;
    const allLogs = data && data.logs ? _.orderBy(data.logs, 'start', 'desc') : [];
    const logs = req.query.filter && req.query.filter === 'errors' ? _.filter(allLogs, log => !!log.error) : allLogs;
    const page = req.query.page && parseInt(req.query.page) ? parseInt(req.query.page) - 1 : 0;
    const perPage = req.query.per_page && parseInt(req.query.per_page) || 10;
    const offset = perPage * page;

    return res.json({ logs: logs.slice(offset, offset + perPage), total: logs.length, lastRun });
  }).catch(next));

  return app;
};

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

const express = __webpack_require__(4);
const metadata = __webpack_require__(25);

module.exports = () => {
  const api = express.Router();
  api.get('/', (req, res) => {
    res.status(200).send(metadata);
  });

  return api;
};

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

const tools = __webpack_require__(3);

const expressApp = __webpack_require__(14);
const config = __webpack_require__(0);
const logger = __webpack_require__(2);

const createServer = tools.createServer((config, storage) => {
  logger.info('Starting Auth0 Logging Extension - Version:', "1.0.0");
  return expressApp(config, storage);
});

module.exports = (context, req, res) => {
  const publicUrl = req.x_wt && req.x_wt.ectx && req.x_wt.ectx.PUBLIC_WT_URL || false;
  if (!publicUrl) {
    config.setValue('PUBLIC_WT_URL', tools.urlHelpers.getWebtaskUrl(req));
  }

  createServer(context, req, res);
};

/***/ }),
/* 25 */
/***/ (function(module, exports) {

module.exports = {"author":"auth0","type":"cron","category":"log_export","initialUrlPath":"/login","repository":"https://github.com/auth0-extensions/auth0-logs-to-provider","keywords":["auth0","extension"],"schedule":"0 */5 * * * *","auth0":{"createClient":true,"onUninstallPath":"/.extensions/on-uninstall","scopes":"read:logs delete:clients"},"secrets":{"BATCH_SIZE":{"description":"The amount of logs to batch before sending. A single cron execution will send multiple batches.","default":100},"START_FROM":{"description":"Checkpoint ID of log to start from."},"SLACK_INCOMING_WEBHOOK_URL":{"description":"Slack Incoming Webhook URL used to report statistics and possible failures"},"SLACK_SEND_SUCCESS":{"description":"This setting will enable verbose notifications to Slack which are useful for troubleshooting","type":"select","allowMultiple":false,"default":"false","options":[{"value":"false","text":"No"},{"value":"true","text":"Yes"}]},"LOG_LEVEL":{"description":"This allows you to specify the log level of events that need to be sent. Selected level includes all levels above.","type":"select","allowMultiple":false,"options":[{"value":"-","text":""},{"value":"4","text":"Critical"},{"value":"3","text":"Error"},{"value":"2","text":"Warning"},{"value":"1","text":"Info"},{"value":"0","text":"Debug"}]},"LOG_TYPES":{"description":"If you only want to send events with a specific type (eg: failed logins)","type":"select","allowMultiple":true,"options":[{"text":"","value":"-"},{"text":"Success Login","value":"s"},{"text":"Success Silent Auth","value":"ssa"},{"text":"Failed Silent Auth","value":"fsa"},{"text":"Success Exchange","value":"seacft"},{"text":"Failed Exchange","value":"feacft"},{"text":"Success Exchange","value":"seccft"},{"text":"Failed Exchange","value":"feccft"},{"text":"Success Exchange","value":"sepft"},{"text":"Failed Exchange","value":"fepft"},{"text":"Success Exchange","value":"sertft"},{"text":"Failed Exchange","value":"fertft"},{"text":"Success Exchange","value":"seoobft"},{"text":"Failed Exchange","value":"feoobft"},{"text":"Success Exchange","value":"seotpft"},{"text":"Failed Exchange","value":"feotpft"},{"text":"Success Exchange","value":"sercft"},{"text":"Failed Exchange","value":"fercft"},{"text":"Failed Login","value":"f"},{"text":"Warning","value":"w"},{"text":"Deprecation Notice","value":"depnote"},{"text":"Deleted User","value":"du"},{"text":"Failed Login (invalid email/username)","value":"fu"},{"text":"Failed Login (wrong password)","value":"fp"},{"text":"Failed by Connector","value":"fc"},{"text":"Failed by CORS","value":"fco"},{"text":"Connector Online","value":"con"},{"text":"Connector Offline","value":"coff"},{"text":"Failed Connector Provisioning","value":"fcpro"},{"text":"Success Signup","value":"ss"},{"text":"Failed Signup","value":"fs"},{"text":"Code Sent","value":"cs"},{"text":"Code/Link Sent","value":"cls"},{"text":"Success Verification Email","value":"sv"},{"text":"Failed Verification Email","value":"fv"},{"text":"Success Change Password","value":"scp"},{"text":"Failed Change Password","value":"fcp"},{"text":"Success Post Change Password Hook","value":"scph"},{"text":"Failed Post Change Password Hook","value":"fcph"},{"text":"Success Change Email","value":"sce"},{"text":"Failed Change Email","value":"fce"},{"text":"Success Change Username","value":"scu"},{"text":"Failed Change Username","value":"fcu"},{"text":"Success Change Phone Number","value":"scpn"},{"text":"Failed Change Phone Number","value":"fcpn"},{"text":"Success Verification Email Request","value":"svr"},{"text":"Failed Verification Email Request","value":"fvr"},{"text":"Success Change Password Request","value":"scpr"},{"text":"Failed Change Password Request","value":"fcpr"},{"text":"Failed Sending Notification","value":"fn"},{"text":"API Operation","value":"sapi"},{"text":"Failed API Operation","value":"fapi"},{"text":"Blocked Account","value":"limit_wc"},{"text":"Blocked IP Address","value":"limit_mu"},{"text":"Too Many Calls to /userinfo","value":"limit_ui"},{"text":"Rate Limit On API","value":"api_limit"},{"text":"Too Many Calls to /delegation","value":"limit_delegation"},{"text":"Successful User Deletion","value":"sdu"},{"text":"Failed User Deletion","value":"fdu"},{"text":"Auth0 Update Launched","value":"admin_update_launch"},{"text":"Auth0 OS Update Started","value":"sys_os_update_start"},{"text":"Auth0 OS Update Ended","value":"sys_os_update_end"},{"text":"Auth0 Update Started","value":"sys_update_start"},{"text":"Auth0 Update Ended","value":"sys_update_end"},{"text":"Success Logout","value":"slo"},{"text":"Failed Logout","value":"flo"},{"text":"Success Delegation","value":"sd"},{"text":"Failed Delegation","value":"fd"},{"text":"Unenroll device account","value":"gd_unenroll"},{"text":"Update device account","value":"gd_update_device_account"},{"text":"Module switch","value":"gd_module_switch"},{"text":"Guardian tenant update","value":"gd_tenant_update"},{"text":"Second factor started","value":"gd_start_auth"},{"text":"Enroll started","value":"gd_start_enroll"},{"text":"MFA Enrollment start failed","value":"gd_start_enroll_failed"},{"text":"User delete","value":"gd_user_delete"},{"text":"OTP Auth suceed","value":"gd_auth_succeed"},{"text":"OTP Auth failed","value":"gd_auth_failed"},{"text":"Push notification sent","value":"gd_send_pn"},{"text":"Error sending MFA Push Notification","value":"gd_send_pn_failure"},{"text":"OTP Auth rejected","value":"gd_auth_rejected"},{"text":"Recovery succeed","value":"gd_recovery_succeed"},{"text":"Recovery failed","value":"gd_recovery_failed"},{"text":"SMS Sent","value":"gd_send_sms"},{"text":"Error sending MFA SMS","value":"gd_send_sms_failure"},{"text":"Too many failures","value":"gd_otp_rate_limit_exceed"},{"text":"Too many failures","value":"gd_recovery_rate_limit_exceed"},{"text":"Guardian enrollment complete","value":"gd_enrollment_complete"},{"text":"Users import","value":"fui"},{"text":"Users import","value":"sui"},{"text":"Breached password","value":"pwd_leak"},{"text":"Failed cross origin authentication","value":"fcoa"},{"text":"Success cross origin authentication","value":"scoa"},{"text":"Account unblocked","value":"ublkdu"},{"text":"Success Exchange","value":"sens"},{"text":"Failed Exchange","value":"fens"}]},"NEWRELIC_LICENSEKEY":{"description":"New Relic license key","required":true},"NEWRELIC_HTTP_ENDPOINT":{"description":"New Relic Logs Http endpoint","required":true},"AUTH0_DOMAIN":{"description":"Your AUTH0 domain","required":true}},"title":"Auth0 Logs to New Relic Logs","name":"auth0-logs-to-new-relic-logs","version":"1.0.0","description":"This extension will take all of your Auth0 logs and export them to New Relic Logs","docsUrl":"https://github.com/y-o-u/auth0-logs-to-provider/blob/master/README.md","logoUrl":"https://newrelic.com/assets/newrelic/source/PNG/NR_logo_Horizontal.png"}

/***/ }),
/* 26 */
/***/ (function(module, exports) {

module.exports = require("body-parser@1.12.4");

/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = require("ejs@2.3.1");

/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 29 */
/***/ (function(module, exports) {

module.exports = require("moment@2.10.3");

/***/ }),
/* 30 */
/***/ (function(module, exports) {

module.exports = require("morgan@1.5.3");

/***/ }),
/* 31 */
/***/ (function(module, exports) {

module.exports = require("querystring");

/***/ }),
/* 32 */
/***/ (function(module, exports) {

module.exports = require("request@2.56.0");

/***/ }),
/* 33 */
/***/ (function(module, exports) {

module.exports = require("stream");

/***/ }),
/* 34 */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),
/* 35 */
/***/ (function(module, exports) {

module.exports = require("winston@1.0.0");

/***/ })
/******/ ]);