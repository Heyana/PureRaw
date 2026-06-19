import { defineComponent } from "vue";
import { RouterView } from "vue-router";
import CustomTitleBar from "@/components/CustomTitleBar";

export default defineComponent({
  name: "App",
  setup: () => () => (
    <div class="app-wrapper w-screen h-screen flex flex-col">
      <CustomTitleBar title="PureRaw" />
      <div class="app-content flex-1 min-h-0">
        <RouterView />
      </div>
    </div>
  ),
});
