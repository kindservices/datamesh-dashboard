<script lang="ts">
  import { ComponentContainer, ComponentItemConfig, GoldenLayout, ItemType, LayoutConfig } from 'golden-layout';
  import { onMount } from "svelte";
  import WidgetPicker from './WidgetPicker.svelte';

  let goldenLayout;


    const myLayout: LayoutConfig = {
      root: {
        type: 'row',
        content: [
          {
            title: 'New Component',
            type: 'component',
            componentType: 'NewComponent'
          }
        ]
      }
    };

    onMount(async () => {

      const menuContainerElement = document.querySelector('#menuContainer');
      const layoutElement = document.querySelector('#layoutContainer');

      goldenLayout = new GoldenLayout(layoutElement);


      goldenLayout.loadLayout(myLayout);

    });

</script>

<div class="container">
  <div class="header">
    <ul id="menuContainer">
      {#if goldenLayout}
        <li><WidgetPicker {goldenLayout} /></li>
      {/if}
    </ul>
  </div>
  <div class="body">
    <div id="layoutContainer"></div>
  </div>
  <div class="footer">Footer content</div>
</div>


<style>
@import "https://golden-layout.com/files/latest/css/goldenlayout-base.css";
@import "https://golden-layout.com/files/latest/css/goldenlayout-dark-theme.css";

:global(body) {
  margin: 0;
  padding: 0;
}

*{
  margin: 0;
  padding: 0;
  list-style-type:none;
}

.container {
  margin: 0;
  padding: 0;
  background-color: red;
  display: flex;
  flex-direction: column;
  height: 100vh; /* 100% of the viewport height */
  width: 100vw; /* 100% of the viewport height */
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
}

li {
  margin-right: 10px;
}


.header {
  height: 30px; /* Fixed height for the header */
  flex: 0 0 auto; /* Do not grow or shrink, and take the specified height */
}

.body {
  flex: 1; /* Allow the middle content to grow and fill the remaining space */
  overflow: auto; /* Add overflow behavior if content exceeds available space */
}

.footer {
  height: 30px; /* Fixed height for the footer */
  flex: 0 0 auto; /* Do not grow or shrink, and take the specified height */
}


#menuContainer{
  flex: 0 0 auto;
  margin-right: 3px;
}

#menuContainer li{
  border-bottom: 1px solid #000;
  border-top: 1px solid #333;
  cursor: pointer;
  padding: 2px 20px;
  color: #BBB;
  background: #1a1a1a;
  font: 12px Arial, sans-serif;
}

#menuContainer li:hover{
  background: #111;
  color: #CCC;
}

#layoutContainer {
  flex: 1 1 auto;
  height: 100%;
  width: 100%;
  color: white;
  border: blue solid 2;
}
    </style>