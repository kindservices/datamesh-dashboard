<script lang="ts">
  import { ComponentContainer, GoldenLayout, LayoutConfig } from 'golden-layout';
  import { onMount } from 'svelte';

  interface WidgetData {
    id: string;
    isStale :  Boolean;
    label : string;
    secondsSinceLastHeartbeat : number;
  }

  export let goldenLayout;
  let widgets = [];
  let widgetById =  Map<string, WidgetData>; // this is derived from the 'widgets' list
  let selectedWidget = '';

  // Function to fetch widget data
  async function fetchWidgets() {
    try {
      const response = await fetch('api/component');
      const data = await response.json();
      widgets = data;
      // Convert the array to a map keyed on the 'id' field
      widgetById = widgets.reduce((map, obj) => {
        map.set(obj.id, obj);
        return map;
      }, new Map<string, WidgetData>());
      console.log(widgetById);
      
    } catch (error) {
      console.error('Error fetching widgets:', error);
    }
  }

  function dynamicLoad(jsUrl, cssUrl, container) {
    var script = document.createElement('script');
    script.src = jsUrl;

    var css = document.createElement('link');
    css.rel = "stylesheet";
    css.href = cssUrl;

    container.appendChild(script);
    container.appendChild(css);
  }

  const url = (path) => new URL(path, `http://${window.location.host}`);

  const fetchComponent = async (id) => {
      const json = await fetch(url(`/api/component/${id}`)).then(data => {
        return data.json();
      });

      /** FYI, this response is e.g. :
{"id":"kind-test-widget-web","service":{"webComponent":{"jsUrl":"http://kind-test-widget-web.data-mesh/bundle.js","cssUrl":"http://kind-test-widget-web.data-mesh/bundle.css","componentId":"<kind-test-widget param_one=\"some param\"></kind-test-widget>"},"label":"Kind Test","tags":{"props":"param_one"}},"lastUpdated":"2023-10-24T08:09:43.043163542Z"}
      */
      console.log(`fetched ${id} returned ${JSON.stringify(json)}`);
      // the 'componentId' is actually the web component mark-up
      return json.service.webComponent.componentId;
  }

  class NewComponent {
    rootElement: HTMLElement;

    constructor(public container: ComponentContainer) {
      this.rootElement = container.element;
      console.log(`adding ${JSON.stringify(container.state)}`);
      var id = container.state.selectedWidget;
      console.log(`id is ${id}`);
      var widget = widgetById.get(id);
      console.log(`widget is ${widget}`);
      this.rootElement.innerHTML = `<h2>${widget.label}</h2>`;


      const webComponentContainer = document.createElement('span');
      this.rootElement.appendChild(webComponentContainer);

      this.resizeWithContainerAutomatically = true;
      fetchComponent(id).then((markup) => {
         console.log(`async result: ${markup}`);
        //  dynamicLoad(url(`/api/component/${id}/bundle.js`), url(`/api/component/${id}/bundle.css`), document.head);
         dynamicLoad(url(`/api/component/${id}/bundle.js`), url(`/api/component/${id}/bundle.css`), this.rootElement);

          webComponentContainer.innerHTML = markup;
      });
    }
  }

  // Fetch widgets when the component is mounted
  onMount(() => {
      try {
        goldenLayout.registerComponent( 'NewComponent', NewComponent);
      } catch (e) {
        console.log("error registering: " + e);
      }
      fetchWidgets();
    }
  );

  function refreshComponents() {
      fetchWidgets();
  }



  function addComponent() {
      var widget = widgetById.get(selectedWidget);
      goldenLayout.addComponent('NewComponent', {'selectedWidget' : selectedWidget}, widget.label);
  }
</script>
  
<div class="picker">
    <label for="widget-picker">Widget:</label>
    <select bind:value={selectedWidget} id="widget-picker" class="widget-picker">
      {#each widgets as widget (widget.id)}
        {#if (widget.isStale)}
          <option class="stale" value={widget.id}>{widget.label} ({widget.id})</option>
        {:else}
          <option value={widget.id}>{widget.label} ({widget.id})</option>
        {/if}
      {/each}
    </select>
    
    <button on:click={refreshComponents}>Refresh</button>
    <button on:click={addComponent} disabled={selectedWidget == ''} >Add</button>
</div>

<style>
.stale {
  color: grey
}
button {
    color: black
}
.picker {
    width: 400px
}
select {
    width: 200px

}
</style>
  