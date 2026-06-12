/* tslint:disable */
/* eslint-disable */
/**
 * Customers API
 * La Customers API fornisce accesso programmatico a tutti i dati aziendali gestiti da [Amica 20](https://gestionaleamica.com). Supporta il ciclo completo di documenti, fatture, magazzino, contabilità e anagrafiche. Per guide e documentazione completa, visitare [amica.dev](https://amica.dev/).  ## Autenticazione  Tutte le richieste API richiedono un token OAuth 2.0 Bearer valido, da includere nell\'header `Authorization`:  ``` Authorization: Bearer <token> ```  ### Registra la tua app  Per integrare la Customers API registra la tua applicazione sull\'**App Store di Amica**. Al termine della registrazione ottieni una coppia di credenziali OAuth 2.0 — `client_id` e `client_secret` (il secret è mostrato **una sola volta**) — e scegli gli **scope** e il **flusso di autenticazione** desiderati.  ### Scegli il flusso  - **Authorization Code con PKCE** (consigliato per app che operano per conto di un utente Amica): l\'utente autorizza la tua app tramite la pagina di consenso dell\'identity provider; la tua app riceve un `code` da scambiare con un access token.    ```   GET  {identity-provider}/connect/authorize?response_type=code&client_id=<client_id>&redirect_uri=<redirect_uri>&scope=openid%20read%20write%20documenti&code_challenge=<challenge>&code_challenge_method=S256   POST {identity-provider}/connect/token        grant_type=authorization_code&code=<code>&code_verifier=<verifier>&client_id=<client_id>&client_secret=<client_secret>&redirect_uri=<redirect_uri>   ```  - **Client Credentials** (per integrazioni server-to-server, senza utente interattivo):    ```   POST {identity-provider}/connect/token   Content-Type: application/x-www-form-urlencoded    grant_type=client_credentials&client_id=<client_id>&client_secret=<client_secret>&scope=read write documenti contabilita   ```    > **Nota:** il flusso Client Credentials è disponibile solo per le **app private**, non per quelle pubblicate sul marketplace.  In entrambi i casi la risposta contiene l\'`access_token` (JWT con `aud: amica-cloud`) da usare nelle chiamate successive finché non scade (`expires_in`), dopodiché va richiesto un nuovo token. Ogni token contiene uno o più **scope** che determinano le aree accessibili (vedi sotto). Dalla [API Reference](https://amica.dev) è possibile incollare un access token per provare gli endpoint direttamente dal browser.  ## Scope di autorizzazione  L\'accesso agli endpoint è governato dagli scope presenti nel token OAuth:  | Scope | Descrizione | |-|-| | `comune` | Anagrafiche: contatti, indirizzi, nazioni, valute, modalità di pagamento, ecc. | | `magazzino` | Magazzino: articoli, listini, movimenti di magazzino, giacenze, distinte base. | | `contabilita` | Contabilità: registrazioni contabili, scadenze, castelletti IVA, fatture elettroniche XML. | | `documenti` | Documenti: fatture, note di credito, DDT, ordini, preventivi, proforma ed emissione. |  Una richiesta verso un endpoint non coperto dallo scope del token riceverà una risposta `403 Forbidden`.  ## Company ID  La maggior parte degli endpoint è relativa a una specifica azienda e segue il pattern:  ``` /api/v3/{companyId}/risorsa ```  Il `companyId` è l\'identificativo univoco di ciascun database aziendale. Usare l\'endpoint `GET /api/v3/config/Azienda` per ottenere l\'elenco delle aziende disponibili.  ## Paginazione  Gli endpoint che restituiscono liste supportano la paginazione tramite query parameter:  | Parametro | Descrizione | |-|-| | `Skip` | Numero di elementi da saltare dall\'inizio del set di risultati. | | `Take` | Numero di elementi da includere nella risposta. |  La risposta include due header:  | Header | Descrizione | |-|-| | `X-Read-TotalCount` | Numero totale di elementi che soddisfano il filtro corrente. | | `X-Read-Count` | Numero di elementi effettivamente restituiti nel body della risposta. |  ## Ordinamento e filtri  Gli endpoint lista accettano parametri aggiuntivi:  | Parametro | Descrizione | |-|-| | `Order` | Lista di proprietà per l\'ordinamento, separate da virgola. Un segno meno (`-`) prima del nome indica ordine discendente. Es. `-RagioneSociale1,Citta`. | | `Filter` | Condizioni di ricerca: lista di espressioni separate da virgola, ciascuna formata da nome campo, operatore, valore ed eventuale connettore logico. Operatori: `$eq`, `$ne`, `$gt`, `$lt`, `$lte`, `$gte`, `$ct` (contiene), `$nct`, `$sw` (inizia con), `$ew` (finisce con). Connettori: `$and` (default, omissibile) e `$or`; le sotto-query si racchiudono tra `[]`. Es. `RagioneSociale1 $ct acme $or, Fido $gt 1000`. | | `SkipTotalCount` | Se `true`, l\'header `X-Read-TotalCount` viene omesso dalla risposta: migliori prestazioni a scapito del conteggio totale. Default `false`. |  ## Espansione oggetti correlati  Gli endpoint singoli e lista supportano il parametro `Expand`. Quando fornito, gli oggetti correlati vengono inclusi inline nella risposta anziché restituiti come riferimenti. È possibile specificare espansioni multiple separate da virgola.  ## Gestione errori  L\'API usa codici di stato HTTP standard e restituisce [RFC 7807](https://tools.ietf.org/html/rfc7807) Problem Details in caso di errore:  | Codice | Significato | |-|-| | `400` | Bad Request — validazione fallita o parametro obbligatorio mancante. | | `401` | Unauthorized — token mancante o scaduto. | | `403` | Forbidden — il token non possiede lo scope richiesto. | | `404` | Not Found — la risorsa richiesta non esiste. | | `409` | Conflict — conflitto di concorrenza. | | `422` | Unprocessable Entity — entità non processabile (es. token di concorrenza obsoleto). |  Alcune risposte `400` includono un campo `overridable` che indica se l\'errore di validazione può essere ignorato impostando il parametro `validationOverride` a `true`.  ## Controllo della concorrenza  Le entità contengono una proprietà `ConcurrencyToken`. Quando si aggiorna un\'entità tramite `PUT`, il token nel body della richiesta viene confrontato con il valore memorizzato. Se differiscono, viene restituito un `422 Unprocessable Entity`. Usare sempre l\'ultimo token ricevuto da una risposta `GET` o `POST`. 
 *
 * The version of the OpenAPI document: v3
 * Contact: assistenza@gestionaleamica.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
/**
 * Modello standard di fattura elettronica.
 * @export
 * @interface FatturaElettronicaXmlTemplate
 */
export interface FatturaElettronicaXmlTemplate {
    /**
     * Identificativo univoco.
     * @type {number}
     * @memberof FatturaElettronicaXmlTemplate
     */
    id?: number;
    /**
     * Il token di concorrenza implementa il controllo di concorrenza ottimistica: a ogni operazione di aggiornamento o cancellazione il valore del token sul database viene confrontato con quello sull'entità. Se i valori coincidono, l'operazione viene eseguita; se differiscono, si assume che un altro utente abbia effettuato una scrittura nel frattempo e l'aggiornamento viene rifiutato.
     * @type {number}
     * @memberof FatturaElettronicaXmlTemplate
     */
    concurrencyToken?: number;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    soggettoEmittente?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    idTrasmittenteIdPaese?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    cedentePrestatoreIdPaese?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    progressivoInvio?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    alboProfessionale?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    provinciaAlbo?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    numeroIscrizioneAlbo?: string | null;
    /**
     * 
     * @type {Date}
     * @memberof FatturaElettronicaXmlTemplate
     */
    dataIscrizioneAlbo?: Date | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    regimeFiscale?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    sedeNazione?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    sedeNumeroCivico?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    stabileOrganizzazioneIndirizzo?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    stabileOrganizzazioneNumeroCivico?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    stabileOrganizzazioneCap?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    stabileOrganizzazioneComune?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    stabileOrganizzazioneProvincia?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    stabileOrganizzazioneNazione?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    reaNumero?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    reaUfficio?: string | null;
    /**
     * 
     * @type {number}
     * @memberof FatturaElettronicaXmlTemplate
     */
    reaCapitaleSociale?: number | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    reaSocioUnico?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    reaStatoLiquidazione?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    rappresentanteIdPaese?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    rappresentanteIdCodice?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    rappresentanteCodiceFiscale?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    rappresentanteDenominazione?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    rappresentanteNome?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    rappresentanteCognome?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    rappresentanteTitolo?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    rappresentanteCodEori?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    intermediarioIdPaese?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    intermediarioIdCodice?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    intermediarioCodiceFiscale?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    intermediarioDenominazione?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    intermediarioNome?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    intermediarioCognome?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    intermediarioTitolo?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FatturaElettronicaXmlTemplate
     */
    intermediarioCodEori?: string | null;
}

/**
 * Check if a given object implements the FatturaElettronicaXmlTemplate interface.
 */
export function instanceOfFatturaElettronicaXmlTemplate(value: object): value is FatturaElettronicaXmlTemplate {
    return true;
}

export function FatturaElettronicaXmlTemplateFromJSON(json: any): FatturaElettronicaXmlTemplate {
    return FatturaElettronicaXmlTemplateFromJSONTyped(json, false);
}

export function FatturaElettronicaXmlTemplateFromJSONTyped(json: any, ignoreDiscriminator: boolean): FatturaElettronicaXmlTemplate {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'concurrencyToken': json['concurrencyToken'] == null ? undefined : json['concurrencyToken'],
        'soggettoEmittente': json['soggettoEmittente'] == null ? undefined : json['soggettoEmittente'],
        'idTrasmittenteIdPaese': json['idTrasmittenteIdPaese'] == null ? undefined : json['idTrasmittenteIdPaese'],
        'cedentePrestatoreIdPaese': json['cedentePrestatoreIdPaese'] == null ? undefined : json['cedentePrestatoreIdPaese'],
        'progressivoInvio': json['progressivoInvio'] == null ? undefined : json['progressivoInvio'],
        'alboProfessionale': json['alboProfessionale'] == null ? undefined : json['alboProfessionale'],
        'provinciaAlbo': json['provinciaAlbo'] == null ? undefined : json['provinciaAlbo'],
        'numeroIscrizioneAlbo': json['numeroIscrizioneAlbo'] == null ? undefined : json['numeroIscrizioneAlbo'],
        'dataIscrizioneAlbo': json['dataIscrizioneAlbo'] == null ? undefined : (new Date(json['dataIscrizioneAlbo'])),
        'regimeFiscale': json['regimeFiscale'] == null ? undefined : json['regimeFiscale'],
        'sedeNazione': json['sedeNazione'] == null ? undefined : json['sedeNazione'],
        'sedeNumeroCivico': json['sedeNumeroCivico'] == null ? undefined : json['sedeNumeroCivico'],
        'stabileOrganizzazioneIndirizzo': json['stabileOrganizzazioneIndirizzo'] == null ? undefined : json['stabileOrganizzazioneIndirizzo'],
        'stabileOrganizzazioneNumeroCivico': json['stabileOrganizzazioneNumeroCivico'] == null ? undefined : json['stabileOrganizzazioneNumeroCivico'],
        'stabileOrganizzazioneCap': json['stabileOrganizzazioneCap'] == null ? undefined : json['stabileOrganizzazioneCap'],
        'stabileOrganizzazioneComune': json['stabileOrganizzazioneComune'] == null ? undefined : json['stabileOrganizzazioneComune'],
        'stabileOrganizzazioneProvincia': json['stabileOrganizzazioneProvincia'] == null ? undefined : json['stabileOrganizzazioneProvincia'],
        'stabileOrganizzazioneNazione': json['stabileOrganizzazioneNazione'] == null ? undefined : json['stabileOrganizzazioneNazione'],
        'reaNumero': json['reaNumero'] == null ? undefined : json['reaNumero'],
        'reaUfficio': json['reaUfficio'] == null ? undefined : json['reaUfficio'],
        'reaCapitaleSociale': json['reaCapitaleSociale'] == null ? undefined : json['reaCapitaleSociale'],
        'reaSocioUnico': json['reaSocioUnico'] == null ? undefined : json['reaSocioUnico'],
        'reaStatoLiquidazione': json['reaStatoLiquidazione'] == null ? undefined : json['reaStatoLiquidazione'],
        'rappresentanteIdPaese': json['rappresentanteIdPaese'] == null ? undefined : json['rappresentanteIdPaese'],
        'rappresentanteIdCodice': json['rappresentanteIdCodice'] == null ? undefined : json['rappresentanteIdCodice'],
        'rappresentanteCodiceFiscale': json['rappresentanteCodiceFiscale'] == null ? undefined : json['rappresentanteCodiceFiscale'],
        'rappresentanteDenominazione': json['rappresentanteDenominazione'] == null ? undefined : json['rappresentanteDenominazione'],
        'rappresentanteNome': json['rappresentanteNome'] == null ? undefined : json['rappresentanteNome'],
        'rappresentanteCognome': json['rappresentanteCognome'] == null ? undefined : json['rappresentanteCognome'],
        'rappresentanteTitolo': json['rappresentanteTitolo'] == null ? undefined : json['rappresentanteTitolo'],
        'rappresentanteCodEori': json['rappresentanteCodEori'] == null ? undefined : json['rappresentanteCodEori'],
        'intermediarioIdPaese': json['intermediarioIdPaese'] == null ? undefined : json['intermediarioIdPaese'],
        'intermediarioIdCodice': json['intermediarioIdCodice'] == null ? undefined : json['intermediarioIdCodice'],
        'intermediarioCodiceFiscale': json['intermediarioCodiceFiscale'] == null ? undefined : json['intermediarioCodiceFiscale'],
        'intermediarioDenominazione': json['intermediarioDenominazione'] == null ? undefined : json['intermediarioDenominazione'],
        'intermediarioNome': json['intermediarioNome'] == null ? undefined : json['intermediarioNome'],
        'intermediarioCognome': json['intermediarioCognome'] == null ? undefined : json['intermediarioCognome'],
        'intermediarioTitolo': json['intermediarioTitolo'] == null ? undefined : json['intermediarioTitolo'],
        'intermediarioCodEori': json['intermediarioCodEori'] == null ? undefined : json['intermediarioCodEori'],
    };
}

export function FatturaElettronicaXmlTemplateToJSON(json: any): FatturaElettronicaXmlTemplate {
    return FatturaElettronicaXmlTemplateToJSONTyped(json, false);
}

export function FatturaElettronicaXmlTemplateToJSONTyped(value?: FatturaElettronicaXmlTemplate | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'concurrencyToken': value['concurrencyToken'],
        'soggettoEmittente': value['soggettoEmittente'],
        'idTrasmittenteIdPaese': value['idTrasmittenteIdPaese'],
        'cedentePrestatoreIdPaese': value['cedentePrestatoreIdPaese'],
        'progressivoInvio': value['progressivoInvio'],
        'alboProfessionale': value['alboProfessionale'],
        'provinciaAlbo': value['provinciaAlbo'],
        'numeroIscrizioneAlbo': value['numeroIscrizioneAlbo'],
        'dataIscrizioneAlbo': value['dataIscrizioneAlbo'] == null ? undefined : ((value['dataIscrizioneAlbo'] as any).toISOString()),
        'regimeFiscale': value['regimeFiscale'],
        'sedeNazione': value['sedeNazione'],
        'sedeNumeroCivico': value['sedeNumeroCivico'],
        'stabileOrganizzazioneIndirizzo': value['stabileOrganizzazioneIndirizzo'],
        'stabileOrganizzazioneNumeroCivico': value['stabileOrganizzazioneNumeroCivico'],
        'stabileOrganizzazioneCap': value['stabileOrganizzazioneCap'],
        'stabileOrganizzazioneComune': value['stabileOrganizzazioneComune'],
        'stabileOrganizzazioneProvincia': value['stabileOrganizzazioneProvincia'],
        'stabileOrganizzazioneNazione': value['stabileOrganizzazioneNazione'],
        'reaNumero': value['reaNumero'],
        'reaUfficio': value['reaUfficio'],
        'reaCapitaleSociale': value['reaCapitaleSociale'],
        'reaSocioUnico': value['reaSocioUnico'],
        'reaStatoLiquidazione': value['reaStatoLiquidazione'],
        'rappresentanteIdPaese': value['rappresentanteIdPaese'],
        'rappresentanteIdCodice': value['rappresentanteIdCodice'],
        'rappresentanteCodiceFiscale': value['rappresentanteCodiceFiscale'],
        'rappresentanteDenominazione': value['rappresentanteDenominazione'],
        'rappresentanteNome': value['rappresentanteNome'],
        'rappresentanteCognome': value['rappresentanteCognome'],
        'rappresentanteTitolo': value['rappresentanteTitolo'],
        'rappresentanteCodEori': value['rappresentanteCodEori'],
        'intermediarioIdPaese': value['intermediarioIdPaese'],
        'intermediarioIdCodice': value['intermediarioIdCodice'],
        'intermediarioCodiceFiscale': value['intermediarioCodiceFiscale'],
        'intermediarioDenominazione': value['intermediarioDenominazione'],
        'intermediarioNome': value['intermediarioNome'],
        'intermediarioCognome': value['intermediarioCognome'],
        'intermediarioTitolo': value['intermediarioTitolo'],
        'intermediarioCodEori': value['intermediarioCodEori'],
    };
}

