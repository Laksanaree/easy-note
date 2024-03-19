<template>
  <v-data-table :headers="headers" :items="filteredItems" class="elevation-1">
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>รายการ</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>

        <v-row>
          <v-col cols="6"></v-col>
          <v-col cols="3">
            <v-autocomplete
              v-model="search"
              label="หมวดหมู่"
              single-line
              hide-details
              :items="categoryListSearch"
            ></v-autocomplete>
          </v-col>
          <v-col cols="3">
            <v-btn color="green" dark class="mb-2" @click="openDialog">
              + เพิ่มรายการ
            </v-btn></v-col
          >
        </v-row>

        <v-dialog v-model="dialog" max-width="500px">
          <v-form ref="from">
            <v-card>
              <v-card-title>
                <span class="text-h5">เพิ่มรายการ</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field
                        v-model="name"
                        label="ชื่อ"
                        outlined
                        dense
                        disabled
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field
                        v-model="data"
                        label="รายการ"
                        outlined
                        dense
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="6" md="6">
                      <v-menu
                        ref="menu"
                        v-model="menudate"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                      >
                        <template #activator="{ on, attrs }">
                          <v-text-field
                            v-model="dateFormatted"
                            outlined
                            dense
                            append-icon="mdi-calendar-month"
                            v-bind="attrs"
                            v-on="on"
                            label="วันที่บันทึก"
                            disabled
                          />
                        </template>
                        <v-date-picker ref="picker" v-model="date" locale="th">
                          <v-card-actions style="margin: -30px 0px 0px 190px">
                            <v-btn
                              color="primary"
                              @click="menudate = false"
                              readonly
                            >
                              ตกลง
                            </v-btn>
                          </v-card-actions>
                        </v-date-picker>
                      </v-menu>
                    </v-col>

                    <v-col cols="12" sm="6" md="6">
                      <v-autocomplete
                        v-model="category"
                        label="หมวดหมู่"
                        outlined
                        dense
                        :items="categoryList"
                      ></v-autocomplete>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="white darken-1"
                  class="cancel-btn"
                  text
                  @click="close"
                >
                  ยกเลิก
                </v-btn>
                <v-btn
                  color="white darken-1"
                  class="save-btn"
                  text
                  @click="saveMode === 'edit' ? saveEdit() : save()"
                >
                  {{ saveMode === 'edit' ? 'บันทึกแก้ไข' : 'บันทึก' }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-dialog>
      </v-toolbar>
    </template>
    <template #[`item.actions`]="{ item }">
      <v-icon small class="mr-2" @click="editItem(item)" color="blue">
        mdi-pencil
      </v-icon>
      <v-icon small @click="deleteData(item)" color="red"> mdi-delete </v-icon>
    </template>
    <template #[`item.actions2`]="{ item }">
      <v-icon small @click="gotoHistory(item)"> mdi-history </v-icon>
    </template>
    <template v-slot:no-data>
      <v-btn color="primary" @click="initialize"> Reset </v-btn>
    </template>
  </v-data-table>
</template>

<script>
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
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import Swal from 'sweetalert2'
import { mapMutations } from 'vuex'

export default {
  data() {
    return {
      search: '',
      saveMode: '',
      menudate: false,
      dateFormatted: null,
      date: null,
      dialog: false,
      dialogDelete: false,
      name: '',
      data: '',
      // date: "",
      category: '',
      categoryList: ['สิ่งที่ต้องทำ', 'งาน', 'รายการที่ต้องซื้อ', 'อื่นๆ'],
      categoryListSearch: [
        'ทั้งหมด',
        'สิ่งที่ต้องทำ',
        'งาน',
        'รายการที่ต้องซื้อ',
        'อื่นๆ',
      ],
      headers: [
        {
          text: 'ชื่อ',
          align: 'start',
          sortable: false,
          value: 'name',
          align: 'center',
        },
        { text: 'รายการ', value: 'data', sortable: false, align: 'center' },
        {
          text: 'วันที่บันทึก',
          value: 'date',
          sortable: false,
          align: 'center',
        },
        { text: 'หมวดหมู่', value: 'category', align: 'center' },
        {
          text: 'การจัดการ',
          value: 'actions',
          sortable: false,
          align: 'center',
        },
        {
          text: 'ดูประวัติ',
          value: 'actions2',
          sortable: false,
          align: 'center',
        },
      ],
      items_data: [],

      defaultItem: {
        name: '',
        data: '',
        date: '',
        category: '',
        editHistory: [],
      },
      data2: [],
    }
  },

  computed: {
    filteredItems() {
      if (!this.search || this.search === 'ทั้งหมด') return this.items_data
      const searchText = this.search.trim().toLowerCase()
      return this.items_data.filter(
        (item) =>
          typeof item.category === 'string' &&
          item.category.toLowerCase().includes(searchText)
      )
    },
  },

  watch: {
    // date(val) {
    //   this.dateFormatted = this.formatDate(this.date);
    // },
    date(newValue) {
      this.dateFormatted = this.formatDate(newValue)
    },
    dialog(val) {
      val || this.close()
    },
    dialogDelete(val) {
      val || this.closeDelete()
    },
  },

  created() {
    this.listData()
    this.getUserData()
    this.setInitialDate()
  },
  methods: {
    ...mapMutations({
      SET_REFID: 'users/SET_REFID',
    }),
    openDialog() {
      this.dialog = true
      this.formTitle = 'เพิ่มรายการ'
    },
    setInitialDate() {
      const currentDate = new Date()
      this.date = currentDate.toISOString().substr(0, 10)
      this.dateFormatted = this.formatDate(this.date)
    },

    async getUserData() {
      try {
        const querySnapshot = await getDocs(collection(db, 'user'))
        querySnapshot.forEach((doc) => {
          const userData = doc.data()
          this.name = userData.email
        })
      } catch (error) {
        console.error('Error fetching user data: ', error)
      }
    },
    close() {
      this.dialog = false
      this.$nextTick(() => {
        // window.location.reload();
      })
    },

    formatDate(val) {
      let d = ''
      if (val === '' || val === null) {
        d = null
      } else {
        const [year, month, day] = val.split('-')
        d = `${day}/${month}/${parseInt(year) + 543}`
      }
      return d
    },

    formatDateInsert(val) {
      let d = null
      if (val) {
        const parts = val.split('-')
        if (parts.length === 3) {
          const [year, month, day] = parts
          const formattedYear = parseInt(year) + 543
          d = `${day}/${month}/${formattedYear}`
        }
      }
      return d
    },
    initialize() {
      this.items_data = []
    },

    close() {
      this.dialog = false
      this.$nextTick(() => {})
    },

    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {})
    },
    async saveEdit() {
      Swal.fire({
        title: 'ต้องการแก้ไขข้อมูลนี้หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'ยกเลิก',
        confirmButtonText: 'ยืนยัน',
      }).then(async (result) => {
        if (result.isConfirmed) {
          const usersCollectionRef = collection(db, 'history')
          const querySnapshot = await getDocs(usersCollectionRef)
          const count = querySnapshot.size
          const docRef = await addDoc(collection(db, 'history'), {
            name: this.name,
            date: this.date,
            data: this.data,
            category: this.category,
            refId: this.refId,
          })
          const refid = doc(db, 'note', this.refId)
          await updateDoc(refid, {
            name: this.name,
            date: this.date,
            data: this.data,
            category: this.category,
          })
          Swal.fire({
            title: 'แก้ไขข้อมูลสำเร็จ',
            icon: 'success',
            showCancelButton: false,
          })

          this.data = ''
          this.category = ''
          this.saveMode = ''
          this.close()
          this.listData()
        } else {
          console.log('error')
        }
      })
    },

    async save() {
      this.buttonDisabled = true
      if (!this.name || !this.date || !this.data || !this.category) {
        Swal.fire({
          icon: 'warning',
          title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        })
        return
      }
      this.loading = true
      console.log(this.date)
      const usersCollectionRef = collection(db, 'note')
      const querySnapshot = await getDocs(usersCollectionRef)
      const count = querySnapshot.size
      const docRef = await addDoc(collection(db, 'note'), {
        name: this.name,
        date: this.date,
        data: this.data,
        category: this.category,
      })
      this.listData()
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'บันทึกข้อมูลสำเร็จ',
        timer: 1500,
      })
      this.data = ''
      this.category = ''
      this.saveMode = ''
      this.close()
    },

    editItem(item) {
      this.SET_REFID(item)
      this.dialog = true

      // if (!item.editHistory) {
      //   this.$set(item, "editHistory", []);
      // }
      // const editRecord = {
      //   editedAt: new Date().toISOString(),
      //   editedFields: ["data", "category", "date"],
      // };
      // item.editHistory.push(editRecord);
      // this.dialog = true;
      this.name = item.name
      this.data = item.data
      this.dateFormatted = item.date
      this.refId = item.refId
      this.category = item.category
      this.saveMode = 'edit'
      this.formTitle = 'แก้ไขรายการ'
    },
    async listData() {
      const querySnapshot = await getDocs(collection(db, 'note'))
      const newData = []
      querySnapshot.forEach((doc) => {
        const product = doc.data()
        product.refId = doc.id
        product.date = this.formatDateInsert(product.date)
        newData.push(product)
      })
      newData.forEach((newItem) => {
        const index = this.items_data.findIndex(
          (existingItem) => existingItem.refId === newItem.refId
        )
        if (index !== -1) {
          this.$set(this.items_data, index, newItem)
        } else {
          this.items_data.push(newItem)
        }
      })

      this.items_data = this.items_data.filter((existingItem) => {
        return newData.some((newItem) => newItem.refId === existingItem.refId)
      })
    },

    async deleteData(item) {
      // alert("ยืนยัน");
      Swal.fire({
        title: 'ต้องการลบข้อมูลนี้หรือไม่?',
        text: 'เมื่อลบไปแล้วไม่สามารถเรียกข้อมูลเดิมได้อีก',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'ยกเลิก',
        confirmButtonText: 'ยืนยัน',
      }).then(async (result) => {
        if (result.isConfirmed) {
          await deleteDoc(doc(db, 'note', item.refId))
          Swal.fire({
            title: 'ลบข้อมูลสำเร็จ',
            icon: 'success',
            showCancelButton: false,
          })
          this.listData()
          // location.reload();
        } else {
          // console.log("error");
        }
      })
    },

    async gotoHistory(item) {
      this.SET_REFID(item)
      this.$router.push({ path: '/history' })
    },
  },
}
</script>

<style >
.cancel-btn {
  background-color: rgb(206, 43, 43) !important;
}
.save-btn {
  background-color: rgb(0, 137, 7) !important;
}
</style>