<template>
  <q-modal :class="assetRegisterClass" content-class="modal-content-limit" v-model="show"  :no-esc-dismiss="true">
  <q-card v-if="user" class="padding-b-40">
    <div class="padding-20 bg-secondary">
      <span class="text-white font-22">{{$t('TRS_TYPE_UIA_ASSET')}}</span>
      <div slot="subtitle"> </div>
    </div>
    <q-card-main class="row justify-center ">
      <q-field class="col-md-8 col-xs-12" :label="$t('ASSET_NAME')" :label-width="3" :error="$v.assets.name.$error" :error-label="$t('ERR_ASSET_NAME_3_TO_6_CAPITAL_LETTERS')" :count="6">
        <q-input @blur="$v.assets.name.$touch" v-model="assets.name" clearable />
      </q-field>
      <q-field class="col-md-8 col-xs-12" :label="$t('DESCRIBE')" :label-width="3" :error="$v.assets.desc.$error" :row="6" :count="500" :error-label="$t('ERR_MISSING_ASSET_DESCRIPTION')">
        <q-input @blur="$v.assets.desc.$touch" type="textarea" v-model="assets.desc" clearable />
      </q-field>
      <q-field class="col-md-8 col-xs-12" :label="$t('TOPLIMIT')" :label-width="3" :error="$v.assets.maximum.$error"  :error-label="$t('ERR_ASSET_TOPLIMIT_NOT_CORRECT')">
        <q-input @blur="$v.assets.maximum.$touch" v-model="assets.maximum" :decimals="0" />
      </q-field>
      <q-field class="col-md-8 col-xs-12" :label="$t('PRECISION')" :helper="$t('ERR_ASSET_PRECISION_MUST_BE_INTEGER_BETWEEN_0_16')" :error="$v.assets.precision.$error" :label-width="3"  :error-label="$t('ERR_ASSET_PRECISION_NOT_CORRECT')">
        <q-input @blur="$v.assets.precision.$touch" v-model="assets.precision" :decimals="0" :step="1"  type="number"/>
      </q-field>
      <q-field v-if="secondSignature" class="col-md-8 col-xs-12" :label="$t('TRS_TYPE_SECOND_PASSWORD')" :error="secondPwdError" :label-width="3"  :error-label="$t('ERR_TOAST_SECONDKEY_WRONG')">
        <q-input @blur="validateSecondPwd" type="password" v-model="secondPwd"  />
      </q-field>
      <div class="row col-10 justify-between margin-top-20">
        <q-btn class="col-3" :label="$t('label.cancel')" color="secondary" outline @click="close"/>
        <q-btn class="col-3" :loading="loading" color="secondary" @click="submit" :disable="$v.$error">
          {{$t('SUBMIT')}}
        </q-btn>
      </div>
      
    </q-card-main>
  </q-card>
  </q-modal>
</template>

<script>
import {
  QField,
  QInput,
  QCard,
  QIcon,
  QCardTitle,
  QCardSeparator,
  QCardMain,
  QBtn,
  QRadio,
  QModal
} from 'quasar'
import { required, maxLength, minLength, between, numeric } from 'vuelidate/lib/validators'
import { assetName, secondPwdReg, amountStrReg } from '../utils/validators'
import { confirm, toastError, toast, translateErrMsg } from '../utils/util'
import { dealGiantNumber } from '../utils/asch'
import asch from '../utils/asch-v2'
import { mapActions, mapGetters } from 'vuex'

export default {
  props: ['show'],
  components: {
    QField,
    QInput,
    QCard,
    QIcon,
    QCardTitle,
    QCardSeparator,
    QCardMain,
    QBtn,
    QRadio,
    QModal
  },
  data() {
    return {
      assets: {
        name: '',
        desc: '',
        maximum: '',
        precision: '',
        strategy: '',
        allowWriteoff: 0,
        allowWhitelist: 0,
        allowBlacklist: 0
      },
      secondPwd: '',
      secondPwdError: false,
      loading: false
    }
  },
  validations: {
    // TODO figure out why vuelidate can not bind vue 'this' in rule config
    assets: {
      name: {
        required,
        assetName: assetName()
      },
      desc: {
        required,
        maxLength: maxLength(500)
      },
      maximum: {
        required,
        numeric,
        maxLength: maxLength(30),
        minLength: minLength(1),
        isNumber(value) {
          return amountStrReg.test(value)
        },
        getPrecision(value) {
          let arr = value.split('.')
          if (arr.length === 1) {
            return true
          }
          return false
        }
      },
      precision: {
        required,
        numeric,
        between: between(0, 16)
      }
    }
  },
  methods: {
    ...mapActions(['broadcastTransaction']),
    submit(e) {
      this.loading = true
      const t = this.$t
      if (!this.issuer) {
        toastError(t('ERR_NO_PUBLISHER_REGISTERED_YET'))
        this.done()
        return
      }
      let pwdValid = false
      if (this.secondSignature) {
        pwdValid = this.validateSecondPwd()
      }
      this.$v.assets.$touch()
      const isValid = this.$v.assets.$invalid
      if (isValid || pwdValid) {
        this.done()
      } else {
        const { secret } = this.user
        const { name, desc, maximum, precision } = this.assets

        let assetName = name
        let realMaximum = dealGiantNumber(maximum, precision)

        confirm(
          {
            title: t('CONFIRM'),
            message: t('OPERATION_REQUIRES_FEE') + '500 XAS',
            cancel: t('CANCEL'),
            confirm: t('CONFIRM')
          },
          () => {
            this.done()
          },
          async () => {
            let trans = asch.registerAsset(
              String(assetName),
              String(desc),
              String(realMaximum),
              precision,
              secret,
              this.secondPwd
            )
            let res = await this.broadcastTransaction(trans)
            if (res.success) {
              this.assets = this.default
              this.$v.assets.$reset()
              this.secondPwd = ''
              toast('succes...')
              this.done()
              this.close()
            } else {
              translateErrMsg(this.$t, res.error)
              this.done()
            }
          }
        )
      }
    },
    validateSecondPwd(val) {
      let isValid = this.pwdValid
      this.secondPwdError = isValid
      return isValid
    },
    done() {
      this.loading = false
    },
    close() {
      this.$emit('close')
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'issuer']),
    user() {
      return this.userInfo
    },
    assetRegisterClass() {
      return this.isDesk ? 'minimized' : 'maximized'
    },
    secondSignature() {
      return this.user ? this.user.account.secondPublicKey : null
    },
    allow() {
      return this.$t('ALLOW')
    },
    notAllow() {
      return this.$t('NOT_ALLOW')
    },
    default() {
      return {
        name: '',
        desc: '',
        maximum: '',
        precision: '',
        strategy: '',
        writeoff: '',
        allowWriteoff: 0,
        allowWhitelist: 0,
        allowBlacklist: 0
      }
    },
    pwdValid() {
      return !secondPwdReg.test(this.secondPwd)
    }
  },
  mounted() {},
  watch: {}
}
</script>

<style lang="stylus" scoped>
</style>

