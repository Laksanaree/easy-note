<template>
  <v-data-table :headers="headers" :items="itemdata" class="elevation-1">
    <template v-slot:top>
      <v-toolbar flat>
        <v-icon small class="mr-2" @click="gotoHome()" color="blue">
          mdi-skip-previous-circle-outline
        </v-icon>
        <v-toolbar-title>ประวัติการแก้ไข</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
      </v-toolbar>
    </template>
  </v-data-table>
</template>

<script>
import { mapGetters } from 'vuex'
import { db } from '../plugins/firebaseInit'
import {
  collection,
  addDoc,
  getDocs,
  query,
  doc,
  deleteDoc,
  updateDoc,
  where,
} from 'firebase/firestore'

export default {
  data() {
    return {
      headers: [
        {
          text: 'ชื่อ',
          align: 'start',
          sortable: false,
          value: 'name',
        },
        { text: 'รายการ', value: 'data', sortable: false },
        { text: 'วันที่บันทึก', value: 'date', sortable: false },
        { text: 'หมวดหมู่', value: 'category' },
      ],
      data: [],
      itemdata: [],
      gg: null
    }
  },
  computed: {
    ...mapGetters({
      GET_REFID: 'users/GET_REFID',
    }),
  },
  async created() {
    this.listhis()
  },
  methods: {
    async listhis() {
      this.data = this.GET_REFID
      const querySnapshot2 = query(
        collection(db, 'history'),
        where('refId', '==', this.data.refId)
      )
      const dataUser = await getDocs(querySnapshot2)
      dataUser.forEach((doc) => {
        this.itemdata.push(doc.data())
      })
      console.log(this.itemdata)
    },
    async gotoHome() {
      this.$router.push({ path: '/home' })
    },
  },
}
</script>

<style>
</style>