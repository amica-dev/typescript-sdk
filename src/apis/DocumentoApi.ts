/* tslint:disable */
/* eslint-disable */
/**
 * Amica Cloud API
 * L\'Amica Cloud API fornisce accesso programmatico a tutti i dati aziendali gestiti da [Amica 20](https://gestionaleamica.com). Supporta il ciclo completo di documenti, fatture, magazzino, contabilità e anagrafiche. Per guide e documentazione completa, visitare [amica.dev](https://amica.dev/).  ## Autenticazione  Tutte le richieste API richiedono un token OAuth 2.0 Bearer valido, da includere nell\'header `Authorization`:  ``` Authorization: Bearer <token> ```  ### Registra la tua app  Per integrare l\'Amica Cloud API registra la tua applicazione sull\'[**App Store di Amica**](https://apps.amica20.it). Al termine della registrazione ottieni una coppia di credenziali OAuth 2.0 — `client_id` e `client_secret` (il secret è mostrato **una sola volta**) — e scegli gli **scope** e il **flusso di autenticazione** desiderati.  ### Scegli il flusso  La scelta dipende da **come** la tua applicazione si autentica:  - C\'è un **utente** che può accedere via browser (web app, SPA, app mobile)? → **Authorization Code con PKCE**. - È un **servizio headless** (backend, batch, integrazione server-to-server) di una **singola azienda**, senza un utente che effettua il login? → **Client Credentials**.  #### Authorization Code con PKCE  Consigliato per le app che operano per conto di un utente Amica ed è l\'**unico flusso disponibile per le app pubblicate sul marketplace**. Una sola registrazione serve un numero qualsiasi di aziende: ogni utente autorizza la tua app per la propria azienda tramite la pagina di consenso dell\'identity provider, e il token riceve automaticamente il contesto di quell\'azienda. La tua app riceve un `code` da scambiare con un access token.  ``` GET  {identity-provider}/connect/authorize?response_type=code&client_id=<client_id>&redirect_uri=<redirect_uri>&scope=openid%20read%20write%20documenti&code_challenge=<challenge>&code_challenge_method=S256 POST {identity-provider}/connect/token      grant_type=authorization_code&code=<code>&code_verifier=<verifier>&client_id=<client_id>&client_secret=<client_secret>&redirect_uri=<redirect_uri> ```  #### Client Credentials  Per integrazioni **server-to-server** senza utente interattivo. Disponibile solo per le **app private**, non per quelle pubblicate sul marketplace. Un\'app Client Credentials è **legata a una singola azienda** — quella dell\'utente che la registra — e il token ne riceve automaticamente il contesto. Per servire un\'azienda diversa serve una registrazione separata; se devi distribuire la stessa app a più aziende usa invece **Authorization Code**.  ``` POST {identity-provider}/connect/token Content-Type: application/x-www-form-urlencoded  grant_type=client_credentials&client_id=<client_id>&client_secret=<client_secret>&scope=comune read write documenti ```  > **Importante:** non includere lo scope `openid` (né `profile`/`email`) in questo flusso. `openid` attiva OpenID Connect — richiede un utente che effettua il login e l\'emissione di un ID token — cosa che un flusso server-to-server non prevede: la richiesta viene rifiutata con l\'errore `Client cannot request OpenID scopes in client credentials flow`. Indica solo gli scope di risorsa (`comune`, `magazzino`, `documenti`, `contabilita`, ed eventualmente `read`/`write`).  In entrambi i casi la risposta contiene l\'`access_token` (JWT con `aud: amica-cloud`) da usare nelle chiamate successive finché non scade (`expires_in`), dopodiché va richiesto un nuovo token. Ogni token contiene uno o più **scope** che determinano le aree accessibili (vedi sotto). Dalla [API Reference](https://amica.dev) è possibile incollare un access token per provare gli endpoint direttamente dal browser.  ## Scope di autorizzazione  L\'accesso agli endpoint è governato dagli scope presenti nel token OAuth:  | Scope | Descrizione | |-|-| | `comune` | Anagrafiche: contatti, indirizzi, nazioni, valute, modalità di pagamento, ecc. | | `magazzino` | Magazzino: articoli, listini, movimenti di magazzino, giacenze, distinte base. | | `contabilita` | Contabilità: registrazioni contabili, scadenze, castelletti IVA, fatture elettroniche XML. | | `documenti` | Documenti: fatture, note di credito, DDT, ordini, preventivi, proforma ed emissione. |  Una richiesta verso un endpoint non coperto dallo scope del token riceverà una risposta `403 Forbidden`.  ## Company ID  La maggior parte degli endpoint è relativa a una specifica azienda e segue il pattern:  ``` /api/v3/{companyId}/risorsa ```  Il `companyId` è l\'identificativo univoco di ciascun database aziendale. Usare l\'endpoint `GET /api/v3/config/Azienda` per ottenere l\'elenco delle aziende disponibili.  ## Paginazione  Gli endpoint che restituiscono liste supportano la paginazione tramite query parameter:  | Parametro | Descrizione | |-|-| | `Skip` | Numero di elementi da saltare dall\'inizio del set di risultati. | | `Take` | Numero di elementi da includere nella risposta. |  La risposta include due header:  | Header | Descrizione | |-|-| | `X-Read-TotalCount` | Numero totale di elementi che soddisfano il filtro corrente. | | `X-Read-Count` | Numero di elementi effettivamente restituiti nel body della risposta. |  ## Ordinamento e filtri  Gli endpoint lista accettano parametri aggiuntivi:  | Parametro | Descrizione | |-|-| | `Order` | Lista di proprietà per l\'ordinamento, separate da virgola. Un segno meno (`-`) prima del nome indica ordine discendente. Es. `-RagioneSociale1,Citta`. | | `Filter` | Condizioni di ricerca: lista di espressioni separate da virgola, ciascuna formata da nome campo, operatore, valore ed eventuale connettore logico. Operatori: `$eq`, `$ne`, `$gt`, `$lt`, `$lte`, `$gte`, `$ct` (contiene), `$nct`, `$sw` (inizia con), `$ew` (finisce con). Connettori: `$and` (default, omissibile) e `$or`; le sotto-query si racchiudono tra `[]`. Es. `RagioneSociale1 $ct acme $or, Fido $gt 1000`. | | `SkipTotalCount` | Se `true`, l\'header `X-Read-TotalCount` viene omesso dalla risposta: migliori prestazioni a scapito del conteggio totale. Default `false`. |  ## Espansione oggetti correlati  Gli endpoint singoli e lista supportano il parametro `Expand`. Quando fornito, gli oggetti correlati vengono inclusi inline nella risposta anziché restituiti come riferimenti. È possibile specificare espansioni multiple separate da virgola.  ## Gestione errori  L\'API usa codici di stato HTTP standard e restituisce [RFC 7807](https://tools.ietf.org/html/rfc7807) Problem Details in caso di errore:  | Codice | Significato | |-|-| | `400` | Bad Request — validazione fallita o parametro obbligatorio mancante. | | `401` | Unauthorized — token mancante o scaduto. | | `403` | Forbidden — accesso negato (vedi sotto le possibili cause). | | `404` | Not Found — la risorsa richiesta non esiste. | | `409` | Conflict — conflitto di concorrenza. | | `422` | Unprocessable Entity — entità non processabile (es. token di concorrenza obsoleto). |  Un `403` può avere tre cause; nelle ultime due il campo `code` della risposta indica quale:  - il token non possiede lo scope richiesto dall\'endpoint; - `code: cloud_not_active` — l\'account lavora con una connessione locale e la Cloud API non espone i suoi dati. Per attivare il servizio cloud contatta l\'assistenza, poi richiedi un nuovo token: lo stato del servizio è letto al rilascio del token; - `code: company_license_not_active` — la licenza dell\'azienda indicata nel percorso è scaduta o non è attiva. Le altre aziende con licenza attiva restano accessibili.  Il motivo dell\'errore è sempre nel campo `detail`. Ogni risposta di errore riporta inoltre `overridable`: quando vale `true`, l\'errore di validazione è *forzabile* e basta ripetere la stessa richiesta aggiungendo `validationOverride=true` alla query string perché il servizio la accetti. È il caso delle anomalie formali su dati reali — la partita IVA di un fornitore estero, per esempio — che il cliente ha comunque bisogno di registrare.  ## Controllo della concorrenza  Le entità contengono una proprietà `ConcurrencyToken`. Quando si aggiorna un\'entità tramite `PUT`, il token nel body della richiesta viene confrontato con il valore memorizzato. Se differiscono, viene restituito un `422 Unprocessable Entity`. Usare sempre l\'ultimo token ricevuto da una risposta `GET` o `POST`. 
 *
 * The version of the OpenAPI document: 3.2.4
 * Contact: assistenza@gestionaleamica.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import type {
  DdtImportData,
  DistinctPropertyGroup,
  Documento,
  DocumentoComputeData,
  DocumentoComputeResult,
  DocumentoImportData,
  DocumentoTotali,
  OrdiniImportData,
  PeriodicInvoicingData,
  ProblemDetails,
  ResoImportData,
} from '../models/index';
import {
    DdtImportDataFromJSON,
    DdtImportDataToJSON,
    DistinctPropertyGroupFromJSON,
    DistinctPropertyGroupToJSON,
    DocumentoFromJSON,
    DocumentoToJSON,
    DocumentoComputeDataFromJSON,
    DocumentoComputeDataToJSON,
    DocumentoComputeResultFromJSON,
    DocumentoComputeResultToJSON,
    DocumentoImportDataFromJSON,
    DocumentoImportDataToJSON,
    DocumentoTotaliFromJSON,
    DocumentoTotaliToJSON,
    OrdiniImportDataFromJSON,
    OrdiniImportDataToJSON,
    PeriodicInvoicingDataFromJSON,
    PeriodicInvoicingDataToJSON,
    ProblemDetailsFromJSON,
    ProblemDetailsToJSON,
    ResoImportDataFromJSON,
    ResoImportDataToJSON,
} from '../models/index';

export interface DocumentoComputeRequest {
    companyId: string;
    idempotencyKey?: string;
    documentoComputeData?: DocumentoComputeData;
}

export interface DocumentoDeleteRequest {
    companyId: string;
    id: number;
    validationOverride?: boolean;
}

export interface DocumentoDistinctRequest {
    companyId: string;
    selector: string;
    skip?: number;
    take?: number;
}

export interface DocumentoEmitRequest {
    companyId: string;
    documentoId: number;
    idempotencyKey?: string;
}

export interface DocumentoGetRequest {
    companyId: string;
    id: number;
    expand?: Array<string>;
}

export interface DocumentoImportAccontiRequest {
    companyId: string;
    id: number;
    validationOverride?: boolean;
    idempotencyKey?: string;
    documentoImportData?: DocumentoImportData;
}

export interface DocumentoImportDdtRequest {
    companyId: string;
    id: number;
    validationOverride?: boolean;
    idempotencyKey?: string;
    ddtImportData?: DdtImportData;
}

export interface DocumentoImportOrdiniRequest {
    companyId: string;
    id: number;
    validationOverride?: boolean;
    idempotencyKey?: string;
    ordiniImportData?: OrdiniImportData;
}

export interface DocumentoImportPreventiviRequest {
    companyId: string;
    id: number;
    validationOverride?: boolean;
    idempotencyKey?: string;
    documentoImportData?: DocumentoImportData;
}

export interface DocumentoImportProFormaRequest {
    companyId: string;
    id: number;
    validationOverride?: boolean;
    idempotencyKey?: string;
    documentoImportData?: DocumentoImportData;
}

export interface DocumentoImportResiRequest {
    companyId: string;
    id: number;
    validationOverride?: boolean;
    idempotencyKey?: string;
    resoImportData?: ResoImportData;
}

export interface DocumentoListRequest {
    companyId: string;
    skip?: number;
    take?: number;
    skipTotalCount?: boolean;
    filter?: string;
    order?: string;
    expand?: Array<string>;
}

export interface DocumentoNewInstanceRequest {
    companyId: string;
}

export interface DocumentoNewInstanceFromTemplateRequest {
    documentoId: number;
    companyId: string;
    idempotencyKey?: string;
}

export interface DocumentoPeriodicInvoicingRequest {
    companyId: string;
    id?: number;
    validationOverride?: boolean;
    idempotencyKey?: string;
    periodicInvoicingData?: PeriodicInvoicingData;
}

export interface DocumentoPostRequest {
    companyId: string;
    validationOverride?: boolean;
    idempotencyKey?: string;
    documento?: Documento;
}

export interface DocumentoPutRequest {
    companyId: string;
    id: number;
    validationOverride?: boolean;
    idempotencyKey?: string;
    documento?: Documento;
}

export interface DocumentoTotaliRequest {
    companyId: string;
    filter?: string;
    raggruppa?: DocumentoTotaliRaggruppaEnum;
}

/**
 * 
 */
export class DocumentoApi extends runtime.BaseAPI {

    /**
     * Calcola i totali di un documento.
     */
    async documentoComputeRaw(requestParameters: DocumentoComputeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<DocumentoComputeResult>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling documentoCompute().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/Documento/compute`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: DocumentoComputeDataToJSON(requestParameters['documentoComputeData']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DocumentoComputeResultFromJSON(jsonValue));
    }

    /**
     * Calcola i totali di un documento.
     */
    async documentoCompute(requestParameters: DocumentoComputeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<DocumentoComputeResult> {
        const response = await this.documentoComputeRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Elimina un elemento.
     */
    async documentoDeleteRaw(requestParameters: DocumentoDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Documento>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling documentoDelete().'
            );
        }

        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling documentoDelete().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['validationOverride'] != null) {
            queryParameters['validationOverride'] = requestParameters['validationOverride'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/Documento/{id}`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))).replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DocumentoFromJSON(jsonValue));
    }

    /**
     * Elimina un elemento.
     */
    async documentoDelete(requestParameters: DocumentoDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Documento> {
        const response = await this.documentoDeleteRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Restituisce una lista di elementi distinti.
     */
    async documentoDistinctRaw(requestParameters: DocumentoDistinctRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<DistinctPropertyGroup>>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling documentoDistinct().'
            );
        }

        if (requestParameters['selector'] == null) {
            throw new runtime.RequiredError(
                'selector',
                'Required parameter "selector" was null or undefined when calling documentoDistinct().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['selector'] != null) {
            queryParameters['Selector'] = requestParameters['selector'];
        }

        if (requestParameters['skip'] != null) {
            queryParameters['Skip'] = requestParameters['skip'];
        }

        if (requestParameters['take'] != null) {
            queryParameters['Take'] = requestParameters['take'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/Documento/distinct`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(DistinctPropertyGroupFromJSON));
    }

    /**
     * Restituisce una lista di elementi distinti.
     */
    async documentoDistinct(requestParameters: DocumentoDistinctRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<DistinctPropertyGroup>> {
        const response = await this.documentoDistinctRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * A seconda del tipo di documento, l\'emissione comporta una serie di operazioni amministrative e contabili:               1) Aggiornamento dell\'`Anagrafica` coinvolta (fatturato, numero fatture, ecc.);              2) Creazione della registrazione contabile di emissione;              3) Creazione delle scadenze attive o passive, in base al tipo di pagamento;              4) Eventuale autoproduzione dei beni fatturati tramite distinta base, se l\'opzione è attiva;              5) Creazione del movimento di magazzino;              6) Aggiornamento delle giacenze dei beni coinvolti, nei rispettivi magazzini;              7) Aggiornamento di eventuali ordini collegati.               Un documento già emesso non può essere riemesso. Alcuni tipi di documento non supportano l\'emissione (ordini e preventivi, ad esempio).
     * Emette un documento.
     */
    async documentoEmitRaw(requestParameters: DocumentoEmitRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Documento>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling documentoEmit().'
            );
        }

        if (requestParameters['documentoId'] == null) {
            throw new runtime.RequiredError(
                'documentoId',
                'Required parameter "documentoId" was null or undefined when calling documentoEmit().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/Documento/{documentoId}/emit`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))).replace(`{${"documentoId"}}`, encodeURIComponent(String(requestParameters['documentoId']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DocumentoFromJSON(jsonValue));
    }

    /**
     * A seconda del tipo di documento, l\'emissione comporta una serie di operazioni amministrative e contabili:               1) Aggiornamento dell\'`Anagrafica` coinvolta (fatturato, numero fatture, ecc.);              2) Creazione della registrazione contabile di emissione;              3) Creazione delle scadenze attive o passive, in base al tipo di pagamento;              4) Eventuale autoproduzione dei beni fatturati tramite distinta base, se l\'opzione è attiva;              5) Creazione del movimento di magazzino;              6) Aggiornamento delle giacenze dei beni coinvolti, nei rispettivi magazzini;              7) Aggiornamento di eventuali ordini collegati.               Un documento già emesso non può essere riemesso. Alcuni tipi di documento non supportano l\'emissione (ordini e preventivi, ad esempio).
     * Emette un documento.
     */
    async documentoEmit(requestParameters: DocumentoEmitRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Documento> {
        const response = await this.documentoEmitRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Restituisce un elemento.
     */
    async documentoGetRaw(requestParameters: DocumentoGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Documento>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling documentoGet().'
            );
        }

        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling documentoGet().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['expand'] != null) {
            queryParameters['Expand'] = requestParameters['expand'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/Documento/{id}`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))).replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DocumentoFromJSON(jsonValue));
    }

    /**
     * Restituisce un elemento.
     */
    async documentoGet(requestParameters: DocumentoGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Documento> {
        const response = await this.documentoGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Importa righe da uno o più acconti in un documento esistente.
     */
    async documentoImportAccontiRaw(requestParameters: DocumentoImportAccontiRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Documento>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling documentoImportAcconti().'
            );
        }

        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling documentoImportAcconti().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['validationOverride'] != null) {
            queryParameters['validationOverride'] = requestParameters['validationOverride'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/Documento/{id}/import/acconto`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))).replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: DocumentoImportDataToJSON(requestParameters['documentoImportData']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DocumentoFromJSON(jsonValue));
    }

    /**
     * Importa righe da uno o più acconti in un documento esistente.
     */
    async documentoImportAcconti(requestParameters: DocumentoImportAccontiRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Documento> {
        const response = await this.documentoImportAccontiRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Importa righe da uno o più DDT in un documento esistente.
     */
    async documentoImportDdtRaw(requestParameters: DocumentoImportDdtRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Documento>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling documentoImportDdt().'
            );
        }

        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling documentoImportDdt().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['validationOverride'] != null) {
            queryParameters['validationOverride'] = requestParameters['validationOverride'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/Documento/{id}/import/ddt`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))).replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: DdtImportDataToJSON(requestParameters['ddtImportData']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DocumentoFromJSON(jsonValue));
    }

    /**
     * Importa righe da uno o più DDT in un documento esistente.
     */
    async documentoImportDdt(requestParameters: DocumentoImportDdtRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Documento> {
        const response = await this.documentoImportDdtRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Importa righe da uno o più ordini in un documento esistente.
     */
    async documentoImportOrdiniRaw(requestParameters: DocumentoImportOrdiniRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Documento>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling documentoImportOrdini().'
            );
        }

        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling documentoImportOrdini().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['validationOverride'] != null) {
            queryParameters['validationOverride'] = requestParameters['validationOverride'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/Documento/{id}/import/ordine`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))).replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: OrdiniImportDataToJSON(requestParameters['ordiniImportData']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DocumentoFromJSON(jsonValue));
    }

    /**
     * Importa righe da uno o più ordini in un documento esistente.
     */
    async documentoImportOrdini(requestParameters: DocumentoImportOrdiniRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Documento> {
        const response = await this.documentoImportOrdiniRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Importa righe da uno o più preventivi in un documento esistente.
     */
    async documentoImportPreventiviRaw(requestParameters: DocumentoImportPreventiviRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Documento>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling documentoImportPreventivi().'
            );
        }

        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling documentoImportPreventivi().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['validationOverride'] != null) {
            queryParameters['validationOverride'] = requestParameters['validationOverride'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/Documento/{id}/import/preventivo`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))).replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: DocumentoImportDataToJSON(requestParameters['documentoImportData']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DocumentoFromJSON(jsonValue));
    }

    /**
     * Importa righe da uno o più preventivi in un documento esistente.
     */
    async documentoImportPreventivi(requestParameters: DocumentoImportPreventiviRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Documento> {
        const response = await this.documentoImportPreventiviRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Importa righe da una o più fatture proforma in un documento esistente.
     */
    async documentoImportProFormaRaw(requestParameters: DocumentoImportProFormaRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Documento>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling documentoImportProForma().'
            );
        }

        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling documentoImportProForma().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['validationOverride'] != null) {
            queryParameters['validationOverride'] = requestParameters['validationOverride'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/Documento/{id}/import/proforma`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))).replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: DocumentoImportDataToJSON(requestParameters['documentoImportData']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DocumentoFromJSON(jsonValue));
    }

    /**
     * Importa righe da una o più fatture proforma in un documento esistente.
     */
    async documentoImportProForma(requestParameters: DocumentoImportProFormaRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Documento> {
        const response = await this.documentoImportProFormaRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Importa righe da uno o più resi in un documento esistente.
     */
    async documentoImportResiRaw(requestParameters: DocumentoImportResiRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Documento>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling documentoImportResi().'
            );
        }

        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling documentoImportResi().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['validationOverride'] != null) {
            queryParameters['validationOverride'] = requestParameters['validationOverride'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/Documento/{id}/import/reso`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))).replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ResoImportDataToJSON(requestParameters['resoImportData']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DocumentoFromJSON(jsonValue));
    }

    /**
     * Importa righe da uno o più resi in un documento esistente.
     */
    async documentoImportResi(requestParameters: DocumentoImportResiRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Documento> {
        const response = await this.documentoImportResiRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     *  La risposta include due header con informazioni sui risultati.  `X-Read-TotalCount` indica il numero di elementi che soddisfano il filtro impostato nella query;  `X-Read-Count` indica il numero di elementi effettivamente contenuti nella risposta.  I due header possono riportare valori diversi quando i parametri `Take` e `Skip` sono stati usati nelle opzioni di query.
     * Restituisce una lista di elementi.
     */
    async documentoListRaw(requestParameters: DocumentoListRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<Documento>>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling documentoList().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['skip'] != null) {
            queryParameters['Skip'] = requestParameters['skip'];
        }

        if (requestParameters['take'] != null) {
            queryParameters['Take'] = requestParameters['take'];
        }

        if (requestParameters['skipTotalCount'] != null) {
            queryParameters['SkipTotalCount'] = requestParameters['skipTotalCount'];
        }

        if (requestParameters['filter'] != null) {
            queryParameters['Filter'] = requestParameters['filter'];
        }

        if (requestParameters['order'] != null) {
            queryParameters['Order'] = requestParameters['order'];
        }

        if (requestParameters['expand'] != null) {
            queryParameters['Expand'] = requestParameters['expand'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/Documento`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(DocumentoFromJSON));
    }

    /**
     *  La risposta include due header con informazioni sui risultati.  `X-Read-TotalCount` indica il numero di elementi che soddisfano il filtro impostato nella query;  `X-Read-Count` indica il numero di elementi effettivamente contenuti nella risposta.  I due header possono riportare valori diversi quando i parametri `Take` e `Skip` sono stati usati nelle opzioni di query.
     * Restituisce una lista di elementi.
     */
    async documentoList(requestParameters: DocumentoListRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<Documento>> {
        const response = await this.documentoListRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Richiede il parametro query `TipoDocumento` (int) che indica il tipo di documento da creare.
     * Restituisce una nuova istanza di un documento del tipo specificato.
     */
    async documentoNewInstanceRaw(requestParameters: DocumentoNewInstanceRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Documento>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling documentoNewInstance().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/Documento/new`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DocumentoFromJSON(jsonValue));
    }

    /**
     * Richiede il parametro query `TipoDocumento` (int) che indica il tipo di documento da creare.
     * Restituisce una nuova istanza di un documento del tipo specificato.
     */
    async documentoNewInstance(requestParameters: DocumentoNewInstanceRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Documento> {
        const response = await this.documentoNewInstanceRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Replica un documento. Crea una copia con la data odierna e, se è un documento di vendita, un nuovo numero. Alcuni campi vengono reimpostati ai valori predefiniti (stato del documento, stato SDI, stato del pagamento, ecc.).
     */
    async documentoNewInstanceFromTemplateRaw(requestParameters: DocumentoNewInstanceFromTemplateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Documento>> {
        if (requestParameters['documentoId'] == null) {
            throw new runtime.RequiredError(
                'documentoId',
                'Required parameter "documentoId" was null or undefined when calling documentoNewInstanceFromTemplate().'
            );
        }

        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling documentoNewInstanceFromTemplate().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/Documento/{documentoId}/newinstancefromtemplate`.replace(`{${"documentoId"}}`, encodeURIComponent(String(requestParameters['documentoId']))).replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DocumentoFromJSON(jsonValue));
    }

    /**
     * Replica un documento. Crea una copia con la data odierna e, se è un documento di vendita, un nuovo numero. Alcuni campi vengono reimpostati ai valori predefiniti (stato del documento, stato SDI, stato del pagamento, ecc.).
     */
    async documentoNewInstanceFromTemplate(requestParameters: DocumentoNewInstanceFromTemplateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Documento> {
        const response = await this.documentoNewInstanceFromTemplateRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Genera fatture per tutti i contatti che corrispondono ai criteri di fatturazione periodica.
     */
    async documentoPeriodicInvoicingRaw(requestParameters: DocumentoPeriodicInvoicingRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<Documento>>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling documentoPeriodicInvoicing().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['id'] != null) {
            queryParameters['id'] = requestParameters['id'];
        }

        if (requestParameters['validationOverride'] != null) {
            queryParameters['validationOverride'] = requestParameters['validationOverride'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/Documento/periodicinvoicing`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: PeriodicInvoicingDataToJSON(requestParameters['periodicInvoicingData']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(DocumentoFromJSON));
    }

    /**
     * Genera fatture per tutti i contatti che corrispondono ai criteri di fatturazione periodica.
     */
    async documentoPeriodicInvoicing(requestParameters: DocumentoPeriodicInvoicingRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<Documento>> {
        const response = await this.documentoPeriodicInvoicingRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Salva un nuovo elemento.
     */
    async documentoPostRaw(requestParameters: DocumentoPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Documento>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling documentoPost().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['validationOverride'] != null) {
            queryParameters['validationOverride'] = requestParameters['validationOverride'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/Documento`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: DocumentoToJSON(requestParameters['documento']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DocumentoFromJSON(jsonValue));
    }

    /**
     * Salva un nuovo elemento.
     */
    async documentoPost(requestParameters: DocumentoPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Documento> {
        const response = await this.documentoPostRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Aggiorna un elemento esistente.
     */
    async documentoPutRaw(requestParameters: DocumentoPutRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Documento>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling documentoPut().'
            );
        }

        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling documentoPut().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['validationOverride'] != null) {
            queryParameters['validationOverride'] = requestParameters['validationOverride'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/Documento/{id}`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))).replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: DocumentoToJSON(requestParameters['documento']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DocumentoFromJSON(jsonValue));
    }

    /**
     * Aggiorna un elemento esistente.
     */
    async documentoPut(requestParameters: DocumentoPutRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Documento> {
        const response = await this.documentoPutRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     *  Le note di credito, clienti e fornitori, entrano nei totali con segno negativo.  Senza raggruppamento la risposta contiene un solo gruppo, anche se nessun documento soddisfa il filtro.             Raggruppando per mese o per anno i gruppi sono in ordine cronologico e `Periodo` ne indica il primo giorno;             raggruppando per anagrafica sono in ordine di totale documento decrescente, con `AnagraficaId` e             `RagioneSociale`.
     * Restituisce i totali dei documenti che soddisfano il filtro, eventualmente raggruppati per mese, anno o anagrafica. I totali sono calcolati dal server: per conoscere il fatturato di un periodo non serve scaricare i documenti.
     */
    async documentoTotaliRaw(requestParameters: DocumentoTotaliRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<DocumentoTotali>>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling documentoTotali().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['filter'] != null) {
            queryParameters['Filter'] = requestParameters['filter'];
        }

        if (requestParameters['raggruppa'] != null) {
            queryParameters['Raggruppa'] = requestParameters['raggruppa'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/Documento/totali`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(DocumentoTotaliFromJSON));
    }

    /**
     *  Le note di credito, clienti e fornitori, entrano nei totali con segno negativo.  Senza raggruppamento la risposta contiene un solo gruppo, anche se nessun documento soddisfa il filtro.             Raggruppando per mese o per anno i gruppi sono in ordine cronologico e `Periodo` ne indica il primo giorno;             raggruppando per anagrafica sono in ordine di totale documento decrescente, con `AnagraficaId` e             `RagioneSociale`.
     * Restituisce i totali dei documenti che soddisfano il filtro, eventualmente raggruppati per mese, anno o anagrafica. I totali sono calcolati dal server: per conoscere il fatturato di un periodo non serve scaricare i documenti.
     */
    async documentoTotali(requestParameters: DocumentoTotaliRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<DocumentoTotali>> {
        const response = await this.documentoTotaliRaw(requestParameters, initOverrides);
        return await response.value();
    }

}

/**
 * @export
 */
export const DocumentoTotaliRaggruppaEnum = {
    Nessuno: 'Nessuno',
    Mese: 'Mese',
    Anno: 'Anno',
    Anagrafica: 'Anagrafica'
} as const;
export type DocumentoTotaliRaggruppaEnum = typeof DocumentoTotaliRaggruppaEnum[keyof typeof DocumentoTotaliRaggruppaEnum];
