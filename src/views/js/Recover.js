
import GoTrue from 'gotrue-js'
import { i18n } from '@ecomplus/utils'

import {
  i19newPassword,
  i19confirmPassword,
  i19passwordChangedSuccessfully
} from '@ecomplus/i18n'

export default {
  name: 'Recover',
  data: () => {
    return {
      newPassword: undefined,
      user: {},
      error: undefined,
      passwordUpdated: false
    }
  },
  created () {
    this.verify()
  },

  methods: {
    verify () {
      const auth = new GoTrue({
        APIUrl: process.env.VUE_APP_GOTRUE_HOST,
        audience: '',
        setCookie: false
      })

      auth.recover(this.$route.params.pathMatch)
        .then(res => { this.user = res })
        .catch(error => { this.error = error })
    },

    updatePassword () {
      this.user.update({ password: this.newPassword })
        .then(res => {
          this.user = res
          this.passwordUpdated = true
          this.error = undefined
        })
        .catch(error => { this.error = error })
    }
  },
  computed: {
    i19newPassword () {
      return i19newPassword ? i18n(i19newPassword) : 'New password'
    },
    i19confirmPassword () {
      return i19confirmPassword ? i18n(i19confirmPassword) : 'Confirm password'
    },
    i19passwordChangedSuccessfully () {
      return i19passwordChangedSuccessfully ? i18n(i19passwordChangedSuccessfully) : 'Password changed successfully'
    }
  }
}
