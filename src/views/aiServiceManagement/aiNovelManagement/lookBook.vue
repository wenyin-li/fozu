<template>
  <div class="app-container" style="white-space: pre-wrap;">
    {{bookInfo}}
  </div>
</template>

<script>
import { getAdminNovelDetail } from "@/api/AiServiceManagement/AiServiceManagement";

export default {
  components: {},
  data() {
    return {
      bookInfo: "",
    };
  },
  created() {
    if (this.$route.query.id) {
      this.getDetail(this.$route.query.id);
    }
  },
  methods: {
    getDetail(id) {
      getAdminNovelDetail({
        id: id,
      }).then((response) => {
        console.log(response, "responseresponse");
        this.bookInfo = response.data.novelContent;
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
