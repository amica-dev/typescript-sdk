# @amica/typescript-sdk — SDK TypeScript per la Customers API di Amica

La Customers API fornisce accesso programmatico a tutti i dati aziendali gestiti da [Amica 20](https://gestionaleamica.com). Supporta il ciclo completo di documenti, fatture, magazzino, contabilità e anagrafiche. Per guide e documentazione completa, visitare [amica.dev](https://amica.dev/).

## Autenticazione

Tutte le richieste API richiedono un token OAuth 2.0 Bearer valido, da includere nell'header `Authorization`:

```
Authorization: Bearer <token>
```

### Registra la tua app

Per integrare la Customers API registra la tua applicazione sull'**App Store di Amica**. Al termine della registrazione ottieni una coppia di credenziali OAuth 2.0 — `client_id` e `client_secret` (il secret è mostrato **una sola volta**) — e scegli gli **scope** e il **flusso di autenticazione** desiderati.

### Scegli il flusso

- **Authorization Code con PKCE** (consigliato per app che operano per conto di un utente Amica): l'utente autorizza la tua app tramite la pagina di consenso dell'identity provider; la tua app riceve un `code` da scambiare con un access token.

  ```
  GET  {identity-provider}/connect/authorize?response_type=code&client_id=<client_id>&redirect_uri=<redirect_uri>&scope=openid%20read%20write%20documenti&code_challenge=<challenge>&code_challenge_method=S256
  POST {identity-provider}/connect/token
       grant_type=authorization_code&code=<code>&code_verifier=<verifier>&client_id=<client_id>&client_secret=<client_secret>&redirect_uri=<redirect_uri>
  ```

- **Client Credentials** (per integrazioni server-to-server, senza utente interattivo):

  ```
  POST {identity-provider}/connect/token
  Content-Type: application/x-www-form-urlencoded

  grant_type=client_credentials&client_id=<client_id>&client_secret=<client_secret>&scope=read write documenti contabilita
  ```

  > **Nota:** il flusso Client Credentials è disponibile solo per le **app private**, non per quelle pubblicate sul marketplace.

In entrambi i casi la risposta contiene l'`access_token` (JWT con `aud: amica-cloud`) da usare nelle chiamate successive finché non scade (`expires_in`), dopodiché va richiesto un nuovo token. Ogni token contiene uno o più **scope** che determinano le aree accessibili (vedi sotto). Dalla [API Reference](https://amica.dev) è possibile incollare un access token per provare gli endpoint direttamente dal browser.

## Scope di autorizzazione

L'accesso agli endpoint è governato dagli scope presenti nel token OAuth:

| Scope | Descrizione |
|-|-|
| `comune` | Anagrafiche: contatti, indirizzi, nazioni, valute, modalità di pagamento, ecc. |
| `magazzino` | Magazzino: articoli, listini, movimenti di magazzino, giacenze, distinte base. |
| `contabilita` | Contabilità: registrazioni contabili, scadenze, castelletti IVA, fatture elettroniche XML. |
| `documenti` | Documenti: fatture, note di credito, DDT, ordini, preventivi, proforma ed emissione. |

Una richiesta verso un endpoint non coperto dallo scope del token riceverà una risposta `403 Forbidden`.

## Company ID

La maggior parte degli endpoint è relativa a una specifica azienda e segue il pattern:

```
/api/v3/{companyId}/risorsa
```

Il `companyId` è l'identificativo univoco di ciascun database aziendale. Usare l'endpoint `GET /api/v3/config/Azienda` per ottenere l'elenco delle aziende disponibili.

## Paginazione

Gli endpoint che restituiscono liste supportano la paginazione tramite query parameter:

| Parametro | Descrizione |
|-|-|
| `Skip` | Numero di elementi da saltare dall'inizio del set di risultati. |
| `Take` | Numero di elementi da includere nella risposta. |

La risposta include due header:

| Header | Descrizione |
|-|-|
| `X-Read-TotalCount` | Numero totale di elementi che soddisfano il filtro corrente. |
| `X-Read-Count` | Numero di elementi effettivamente restituiti nel body della risposta. |

## Ordinamento e filtri

Gli endpoint lista accettano parametri aggiuntivi:

| Parametro | Descrizione |
|-|-|
| `Order` | Lista di proprietà per l'ordinamento, separate da virgola. Un segno meno (`-`) prima del nome indica ordine discendente. Es. `-RagioneSociale1,Citta`. |
| `Filter` | Condizioni di ricerca: lista di espressioni separate da virgola, ciascuna formata da nome campo, operatore, valore ed eventuale connettore logico. Operatori: `$eq`, `$ne`, `$gt`, `$lt`, `$lte`, `$gte`, `$ct` (contiene), `$nct`, `$sw` (inizia con), `$ew` (finisce con). Connettori: `$and` (default, omissibile) e `$or`; le sotto-query si racchiudono tra `[]`. Es. `RagioneSociale1 $ct acme $or, Fido $gt 1000`. |
| `SkipTotalCount` | Se `true`, l'header `X-Read-TotalCount` viene omesso dalla risposta: migliori prestazioni a scapito del conteggio totale. Default `false`. |

## Espansione oggetti correlati

Gli endpoint singoli e lista supportano il parametro `Expand`. Quando fornito, gli oggetti correlati vengono inclusi inline nella risposta anziché restituiti come riferimenti. È possibile specificare espansioni multiple separate da virgola.

## Gestione errori

L'API usa codici di stato HTTP standard e restituisce [RFC 7807](https://tools.ietf.org/html/rfc7807) Problem Details in caso di errore:

| Codice | Significato |
|-|-|
| `400` | Bad Request — validazione fallita o parametro obbligatorio mancante. |
| `401` | Unauthorized — token mancante o scaduto. |
| `403` | Forbidden — il token non possiede lo scope richiesto. |
| `404` | Not Found — la risorsa richiesta non esiste. |
| `409` | Conflict — conflitto di concorrenza. |
| `422` | Unprocessable Entity — entità non processabile (es. token di concorrenza obsoleto). |

Alcune risposte `400` includono un campo `overridable` che indica se l'errore di validazione può essere ignorato impostando il parametro `validationOverride` a `true`.

## Controllo della concorrenza

Le entità contengono una proprietà `ConcurrencyToken`. Quando si aggiorna un'entità tramite `PUT`, il token nel body della richiesta viene confrontato con il valore memorizzato. Se differiscono, viene restituito un `422 Unprocessable Entity`. Usare sempre l'ultimo token ricevuto da una risposta `GET` o `POST`.


## Installazione

Il client è basato su [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API) e funziona in Node.js, nel browser e con i bundler. Installa direttamente dal repository:

```bash
npm install github:amica-dev/typescript-sdk
```

## Per iniziare

```typescript
import { Configuration, AziendaApi } from "@amica/typescript-sdk";

const config = new Configuration({
  basePath: "https://customerws1.amica20.it",
  accessToken: "IL_TUO_ACCESS_TOKEN", // access token OAuth 2.0 ottenuto da Amica
});

// Elenco delle aziende disponibili per le credenziali in uso
const aziende = new AziendaApi(config);

try {
  const result = await aziende.apiVversionConfigAziendaGet({ version: "3" });
  console.log(result);
} catch (err) {
  console.error("Errore nella chiamata all'API:", err);
}
```

## Documentazione

- **Registra la tua app**: crea un'applicazione e ottieni le credenziali OAuth sull'[App Store di Amica](https://apps.amica20.it).
- **Endpoint e modelli**: i tipi e i metodi sono nelle cartelle [`src/apis`](src/apis) e [`src/models`](src/models) di questo repository.
- **API Reference interattiva**: prova gli endpoint dal browser su [customerws1.amica20.it/api/v3/docs](https://customerws1.amica20.it/api/v3/docs).
- **Guide e autenticazione**: [amica.dev](https://amica.dev).

---

SDK generato automaticamente con [OpenAPI Generator](https://openapi-generator.tech) — API `v3`, SDK `0.0.0-dev`, generator `7.11.0`.
