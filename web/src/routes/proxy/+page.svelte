<script lang="ts">
    let url = "http://kafka-rest-proxy.default.svc.cluster.local:8082/topic/user-tracking-data"
    let body = `{ "records" : [ { "key" : "k", "value" : "v" } ] }`

    let message = ''
    
    interface KeyValuePair {
      key: string;
      value: string;
    }

    function arrayToJsonObject(array: KeyValuePair[]): { [key: string]: string } {
        return array.reduce((acc, { key, value }) => {
            acc[key] = value;
            return acc;
        }, {});
    }

    let responseFuture
    let headers : KeyValuePair[] = [{ key: 'Content-Type', value : 'application/vnd.kafka.json.v2+json' }]

    let selectedMethod = 'POST'

    const methods = ['GET', 'POST', 'PUT', 'DELETE']

    function handleMethodChange(event) {
        selectedMethod = event.target.value
    }

    const removeHeader = (i) => {
      headers.splice(i, 1)
      headers = headers
    }
    const addHeader = () => {
      headers.push({key : `key${headers.length + 1}`, value : `value${headers.length + 1}`})
      headers = headers
    }

    function submitProxy() {

        const requestBody = {
            proxy: url,
            method: selectedMethod,
            headers: arrayToJsonObject(headers),
            body: selectedMethod == "GET" ? null : body,
        }

        console.log(`sending ${JSON.stringify(requestBody)}`)
        
        responseFuture = fetch(`/api/proxy`, {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: { 'content-type': 'application/json' }})
        .then(async response => {
            if (!response.ok) {
                message = `HTTP error with status: ${response.status}`
                return message
            } else {
                const content = await response.text()
                console.log(`Got response ${content}`, response)
                return content
            }
        })
        .catch(error => {
            message = `Error: ${error}`
        });
    }
</script>

<form>
    <div class="form-row">
    <label for="url">URL:</label>
    <input type="text" id="url" name="url" bind:value={url} />
</div>

    <div class="form-row">
    <label for="body">Body</label>
    <textarea id="body" name="body" bind:value={body} />
</div>

<label for="httpMethod">HTTP Method:</label>
<select id="httpMethod" bind:value={selectedMethod} on:change={handleMethodChange}>
  {#each methods as method}
    <option value={method}>{method}</option>
  {/each}
</select>

    <h3>{headers.length} {#if headers.length == 1}Header {:else}Headers{/if} <button on:click={addHeader}>Add Header</button></h3>

    {#each headers as h, i}
    <div class="form-row">
    
        <span>
            <a href="void" on:click={e => removeHeader(i)} >remove</a>&nbsp;
      <input class="entry" bind:value={headers[i].key} on:input={e => headers[i].key = e.target.value} >
        </span>

     <input class="entry" bind:value={headers[i].value} on:input={e => headers[i].value = e.target.value} >
    </div>
    {/each}
    

    <input type="submit" value="Submit" on:click={submitProxy}/>
  </form>

  <div>{message}</div>

  {#await responseFuture}
  Loading...
  {:then data}
  {#if data}
  {data}
  {/if}
  {:catch someError}
  Error: {someError.message}
  {/await}

<style>
body {
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

form {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-row {
  display: flex;
  margin-bottom: 16px;
  align-items: center;
}

label {
  margin-right: 10px;
}

input {
  flex: 1;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}

textarea {
  flex: 1;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}

input[type="submit"] {
  background-color: #4caf50;
  color: #fff;
  cursor: pointer;
}

input[type="submit"]:hover {
  background-color: #45a049;
}
</style>