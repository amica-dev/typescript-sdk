/* tslint:disable */
/* eslint-disable */
/**
 * Customers API
 * La Customers API fornisce accesso programmatico a tutti i dati aziendali gestiti da [Amica 20](https://gestionaleamica.com). Supporta il ciclo completo di documenti, fatture, magazzino, contabilità e anagrafiche. Per guide e documentazione completa, visitare [amica.dev](https://amica.dev/).  ## Autenticazione  Tutte le richieste API richiedono un token OAuth 2.0 Bearer valido, da includere nell\'header `Authorization`:  ``` Authorization: Bearer <token> ```  ### Registra la tua app  Per integrare la Customers API registra la tua applicazione sull\'**App Store di Amica**. Al termine della registrazione ottieni una coppia di credenziali OAuth 2.0 — `client_id` e `client_secret` (il secret è mostrato **una sola volta**) — e scegli gli **scope** e il **flusso di autenticazione** desiderati.  ### Scegli il flusso  - **Authorization Code con PKCE** (consigliato per app che operano per conto di un utente Amica): l\'utente autorizza la tua app tramite la pagina di consenso dell\'identity provider; la tua app riceve un `code` da scambiare con un access token.    ```   GET  {identity-provider}/connect/authorize?response_type=code&client_id=<client_id>&redirect_uri=<redirect_uri>&scope=openid%20read%20write%20documenti&code_challenge=<challenge>&code_challenge_method=S256   POST {identity-provider}/connect/token        grant_type=authorization_code&code=<code>&code_verifier=<verifier>&client_id=<client_id>&client_secret=<client_secret>&redirect_uri=<redirect_uri>   ```  - **Client Credentials** (per integrazioni server-to-server, senza utente interattivo):    ```   POST {identity-provider}/connect/token   Content-Type: application/x-www-form-urlencoded    grant_type=client_credentials&client_id=<client_id>&client_secret=<client_secret>&scope=read write documenti contabilita   ```    > **Nota:** il flusso Client Credentials è disponibile solo per le **app private**, non per quelle pubblicate sul marketplace.  In entrambi i casi la risposta contiene l\'`access_token` (JWT con `aud: amica-cloud`) da usare nelle chiamate successive finché non scade (`expires_in`), dopodiché va richiesto un nuovo token. Ogni token contiene uno o più **scope** che determinano le aree accessibili (vedi sotto). Dalla [API Reference](https://amica.dev) è possibile incollare un access token per provare gli endpoint direttamente dal browser.  ## Scope di autorizzazione  L\'accesso agli endpoint è governato dagli scope presenti nel token OAuth:  | Scope | Descrizione | |-------|-------------| | `comune` | Anagrafiche: contatti, indirizzi, nazioni, valute, modalità di pagamento, ecc. | | `magazzino` | Magazzino: articoli, listini, movimenti di magazzino, giacenze, distinte base. | | `contabilita` | Contabilità: registrazioni contabili, scadenze, castelletti IVA, fatture elettroniche XML. | | `documenti` | Documenti: fatture, note di credito, DDT, ordini, preventivi, proforma ed emissione. |  Una richiesta verso un endpoint non coperto dallo scope del token riceverà una risposta `403 Forbidden`.  ## Company ID  La maggior parte degli endpoint è relativa a una specifica azienda e segue il pattern:  ``` /api/v3/{companyId}/risorsa ```  Il `companyId` è l\'identificativo univoco di ciascun database aziendale. Usare l\'endpoint `GET /api/v3/config/Azienda` per ottenere l\'elenco delle aziende disponibili.  ## Paginazione  Gli endpoint che restituiscono liste supportano la paginazione tramite query parameter:  | Parametro | Descrizione | |-----------|-------------| | `Skip` | Numero di elementi da saltare dall\'inizio del set di risultati. | | `Take` | Numero di elementi da includere nella risposta. |  La risposta include due header:  | Header | Descrizione | |--------|-------------| | `X-Read-TotalCount` | Numero totale di elementi che soddisfano il filtro corrente. | | `X-Read-Count` | Numero di elementi effettivamente restituiti nel body della risposta. |  ## Ordinamento e filtri  Gli endpoint lista accettano parametri aggiuntivi:  | Parametro | Descrizione | |-----------|-------------| | `Order` | Lista di proprietà per l\'ordinamento, separate da virgola. Un segno meno (`-`) prima del nome indica ordine discendente. Es. `-RagioneSociale1,Citta`. | | `Filter` | Condizioni di ricerca: lista di espressioni separate da virgola, ciascuna formata da nome campo, operatore, valore ed eventuale connettore logico. Operatori: `$eq`, `$ne`, `$gt`, `$lt`, `$lte`, `$gte`, `$ct` (contiene), `$nct`, `$sw` (inizia con), `$ew` (finisce con). Connettori: `$and` (default, omissibile) e `$or`; le sotto-query si racchiudono tra `[]`. Es. `RagioneSociale1 $ct acme $or, Fido $gt 1000`. | | `SkipTotalCount` | Se `true`, l\'header `X-Read-TotalCount` viene omesso dalla risposta: migliori prestazioni a scapito del conteggio totale. Default `false`. |  ## Espansione oggetti correlati  Gli endpoint singoli e lista supportano il parametro `Expand`. Quando fornito, gli oggetti correlati vengono inclusi inline nella risposta anziché restituiti come riferimenti. È possibile specificare espansioni multiple separate da virgola.  ## Gestione errori  L\'API usa codici di stato HTTP standard e restituisce [RFC 7807](https://tools.ietf.org/html/rfc7807) Problem Details in caso di errore:  | Codice | Significato | |--------|-------------| | `400` | Bad Request — validazione fallita o parametro obbligatorio mancante. | | `401` | Unauthorized — token mancante o scaduto. | | `403` | Forbidden — il token non possiede lo scope richiesto. | | `404` | Not Found — la risorsa richiesta non esiste. | | `409` | Conflict — conflitto di concorrenza. | | `422` | Unprocessable Entity — entità non processabile (es. token di concorrenza obsoleto). |  Alcune risposte `400` includono un campo `overridable` che indica se l\'errore di validazione può essere ignorato impostando il parametro `validationOverride` a `true`.  ## Controllo della concorrenza  Le entità contengono una proprietà `ConcurrencyToken`. Quando si aggiorna un\'entità tramite `PUT`, il token nel body della richiesta viene confrontato con il valore memorizzato. Se differiscono, viene restituito un `422 Unprocessable Entity`. Usare sempre l\'ultimo token ricevuto da una risposta `GET` o `POST`. 
 *
 * The version of the OpenAPI document: v3
 * Contact: assistenza@gestionaleamica.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
import type { CategoriaMerceologica } from './CategoriaMerceologica';
import {
    CategoriaMerceologicaFromJSON,
    CategoriaMerceologicaFromJSONTyped,
    CategoriaMerceologicaToJSON,
    CategoriaMerceologicaToJSONTyped,
} from './CategoriaMerceologica';
import type { Taglia } from './Taglia';
import {
    TagliaFromJSON,
    TagliaFromJSONTyped,
    TagliaToJSON,
    TagliaToJSONTyped,
} from './Taglia';
import type { CausaleIva } from './CausaleIva';
import {
    CausaleIvaFromJSON,
    CausaleIvaFromJSONTyped,
    CausaleIvaToJSON,
    CausaleIvaToJSONTyped,
} from './CausaleIva';
import type { Marca } from './Marca';
import {
    MarcaFromJSON,
    MarcaFromJSONTyped,
    MarcaToJSON,
    MarcaToJSONTyped,
} from './Marca';
import type { Reparto } from './Reparto';
import {
    RepartoFromJSON,
    RepartoFromJSONTyped,
    RepartoToJSON,
    RepartoToJSONTyped,
} from './Reparto';
import type { Produttore } from './Produttore';
import {
    ProduttoreFromJSON,
    ProduttoreFromJSONTyped,
    ProduttoreToJSON,
    ProduttoreToJSONTyped,
} from './Produttore';
import type { ArticoloMediaFile } from './ArticoloMediaFile';
import {
    ArticoloMediaFileFromJSON,
    ArticoloMediaFileFromJSONTyped,
    ArticoloMediaFileToJSON,
    ArticoloMediaFileToJSONTyped,
} from './ArticoloMediaFile';
import type { GruppoMerceologico } from './GruppoMerceologico';
import {
    GruppoMerceologicoFromJSON,
    GruppoMerceologicoFromJSONTyped,
    GruppoMerceologicoToJSON,
    GruppoMerceologicoToJSONTyped,
} from './GruppoMerceologico';
import type { Componente } from './Componente';
import {
    ComponenteFromJSON,
    ComponenteFromJSONTyped,
    ComponenteToJSON,
    ComponenteToJSONTyped,
} from './Componente';

/**
 * Articolo di magazzino o prodotto.
 * @export
 * @interface Articolo
 */
export interface Articolo {
    /**
     * Identificativo univoco.
     * @type {number}
     * @memberof Articolo
     */
    id?: number;
    /**
     * Il token di concorrenza implementa il controllo di concorrenza ottimistica: a ogni operazione di aggiornamento o cancellazione il valore del token sul database viene confrontato con quello sull'entità. Se i valori coincidono, l'operazione viene eseguita; se differiscono, si assume che un altro utente abbia effettuato una scrittura nel frattempo e l'aggiornamento viene rifiutato.
     * @type {number}
     * @memberof Articolo
     */
    concurrencyToken?: number;
    /**
     * Identificativo univoco della Amica.Articolo.CategoriaMerceologica (categoria merceologica).
     * @type {number}
     * @memberof Articolo
     */
    categoriaMerceologicaId?: number | null;
    /**
     * 
     * @type {CategoriaMerceologica}
     * @memberof Articolo
     */
    categoriaMerceologica?: CategoriaMerceologica;
    /**
     * Identificativo univoco del Amica.Articolo.GruppoMerceologico (gruppo merceologico).
     * @type {number}
     * @memberof Articolo
     */
    gruppoMerceologicoId?: number | null;
    /**
     * 
     * @type {GruppoMerceologico}
     * @memberof Articolo
     */
    gruppoMerceologico?: GruppoMerceologico;
    /**
     * Identificativo univoco della Amica.Articolo.CausaleIva (causale IVA).
     * Id univoco della <a href="#tag/CausaleIva">causale IVA</a> predefinita per l'articolo.
     * @type {number}
     * @memberof Articolo
     */
    causaleIvaId?: number | null;
    /**
     * 
     * @type {CausaleIva}
     * @memberof Articolo
     */
    causaleIva?: CausaleIva;
    /**
     * Identificativo univoco della Amica.Articolo.Taglia (taglia).
     * @type {number}
     * @memberof Articolo
     */
    tagliaId?: number | null;
    /**
     * 
     * @type {Taglia}
     * @memberof Articolo
     */
    taglia?: Taglia;
    /**
     * Identificativo univoco della Amica.Articolo.Marca.
     * @type {number}
     * @memberof Articolo
     */
    marcaId?: number | null;
    /**
     * 
     * @type {Marca}
     * @memberof Articolo
     */
    marca?: Marca;
    /**
     * Identificativo univoco del Amica.Articolo.Produttore (produttore).
     * @type {number}
     * @memberof Articolo
     */
    produttoreId?: number | null;
    /**
     * 
     * @type {Produttore}
     * @memberof Articolo
     */
    produttore?: Produttore;
    /**
     * Identificativo univoco del Amica.Articolo.Reparto (reparto).
     * @type {number}
     * @memberof Articolo
     */
    repartoId?: number | null;
    /**
     * 
     * @type {Reparto}
     * @memberof Articolo
     */
    reparto?: Reparto;
    /**
     * Nome.
     * @type {string}
     * @memberof Articolo
     */
    nome: string;
    /**
     * Identificativo, o codice.
     * @type {string}
     * @memberof Articolo
     */
    codice: string;
    /**
     * Nome breve.
     * @type {string}
     * @memberof Articolo
     */
    nomeBreve?: string | null;
    /**
     * Codice dell'articolo o prodotto presso il fornitore.
     * @type {string}
     * @memberof Articolo
     */
    codiceFornitore?: string | null;
    /**
     * Codice dell'articolo o prodotto presso il produttore.
     * @type {string}
     * @memberof Articolo
     */
    codiceProduttore?: string | null;
    /**
     * Modalità di gestione.
     * @type {string}
     * @memberof Articolo
     */
    gestioneArticolo?: ArticoloGestioneArticoloEnum;
    /**
     * Contesto in cui viene utilizzato.
     * @type {string}
     * @memberof Articolo
     */
    contestoArticolo?: ArticoloContestoArticoloEnum;
    /**
     * Codice a barre.
     * @type {string}
     * @memberof Articolo
     */
    barCode?: string | null;
    /**
     * Ultimo prezzo di costo.
     * @type {number}
     * @memberof Articolo
     */
    costoUltimo?: number;
    /**
     * Prezzo di costo medio.
     * @type {number}
     * @memberof Articolo
     */
    costoMedio?: number;
    /**
     * Indica se l'unità di misura deve essere arrotondata all'intero più vicino.
     * @type {boolean}
     * @memberof Articolo
     */
    unitMisuraIntera?: boolean;
    /**
     * Indica se è composto assemblando altri articoli.
     * @type {boolean}
     * @memberof Articolo
     */
    articoloComposto?: boolean;
    /**
     * Stato. `true` se attivo, `false` altrimenti.
     * @type {boolean}
     * @memberof Articolo
     */
    stato?: boolean;
    /**
     * Data di primo inserimento.
     * @type {Date}
     * @memberof Articolo
     */
    dataInserimento?: Date | null;
    /**
     * Unità di misura da utilizzare nei movimenti di magazzino.
     * @type {string}
     * @memberof Articolo
     */
    unitMisuraMovimenti?: string | null;
    /**
     * Unità di misura da utilizzare nelle elaborazioni di inventario.
     * @type {string}
     * @memberof Articolo
     */
    unitMisuraInventario?: string | null;
    /**
     * Fattore di conversione tra unità di movimento e unità di inventario.
     * @type {number}
     * @memberof Articolo
     */
    fattoreConversioneUnitMisura?: number;
    /**
     * Note.
     * @type {string}
     * @memberof Articolo
     */
    note?: string | null;
    /**
     * 
     * @type {ArticoloMediaFile}
     * @memberof Articolo
     */
    mediaFile?: ArticoloMediaFile;
    /**
     * Conto da utilizzare nelle registrazioni contabili di vendita.
     * @type {string}
     * @memberof Articolo
     */
    contoRawVendita?: string | null;
    /**
     * Conto da utilizzare nelle registrazioni contabili di acquisto.
     * @type {string}
     * @memberof Articolo
     */
    contoRawAcquisto?: string | null;
    /**
     * Distinta base.
     * @type {Array<Componente>}
     * @memberof Articolo
     */
    distintaBase?: Array<Componente> | null;
}


/**
 * @export
 */
export const ArticoloGestioneArticoloEnum = {
    Standard: 'Standard',
    TaglieColori: 'TaglieColori',
    NumeriSeriali: 'NumeriSeriali',
    Lotti: 'Lotti'
} as const;
export type ArticoloGestioneArticoloEnum = typeof ArticoloGestioneArticoloEnum[keyof typeof ArticoloGestioneArticoloEnum];

/**
 * @export
 */
export const ArticoloContestoArticoloEnum = {
    Sempre: 'Sempre',
    Vendite: 'Vendite',
    Acquisti: 'Acquisti',
    Mai: 'Mai'
} as const;
export type ArticoloContestoArticoloEnum = typeof ArticoloContestoArticoloEnum[keyof typeof ArticoloContestoArticoloEnum];


/**
 * Check if a given object implements the Articolo interface.
 */
export function instanceOfArticolo(value: object): value is Articolo {
    if (!('nome' in value) || value['nome'] === undefined) return false;
    if (!('codice' in value) || value['codice'] === undefined) return false;
    return true;
}

export function ArticoloFromJSON(json: any): Articolo {
    return ArticoloFromJSONTyped(json, false);
}

export function ArticoloFromJSONTyped(json: any, ignoreDiscriminator: boolean): Articolo {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'concurrencyToken': json['concurrencyToken'] == null ? undefined : json['concurrencyToken'],
        'categoriaMerceologicaId': json['categoriaMerceologicaId'] == null ? undefined : json['categoriaMerceologicaId'],
        'categoriaMerceologica': json['categoriaMerceologica'] == null ? undefined : CategoriaMerceologicaFromJSON(json['categoriaMerceologica']),
        'gruppoMerceologicoId': json['gruppoMerceologicoId'] == null ? undefined : json['gruppoMerceologicoId'],
        'gruppoMerceologico': json['gruppoMerceologico'] == null ? undefined : GruppoMerceologicoFromJSON(json['gruppoMerceologico']),
        'causaleIvaId': json['causaleIvaId'] == null ? undefined : json['causaleIvaId'],
        'causaleIva': json['causaleIva'] == null ? undefined : CausaleIvaFromJSON(json['causaleIva']),
        'tagliaId': json['tagliaId'] == null ? undefined : json['tagliaId'],
        'taglia': json['taglia'] == null ? undefined : TagliaFromJSON(json['taglia']),
        'marcaId': json['marcaId'] == null ? undefined : json['marcaId'],
        'marca': json['marca'] == null ? undefined : MarcaFromJSON(json['marca']),
        'produttoreId': json['produttoreId'] == null ? undefined : json['produttoreId'],
        'produttore': json['produttore'] == null ? undefined : ProduttoreFromJSON(json['produttore']),
        'repartoId': json['repartoId'] == null ? undefined : json['repartoId'],
        'reparto': json['reparto'] == null ? undefined : RepartoFromJSON(json['reparto']),
        'nome': json['nome'],
        'codice': json['codice'],
        'nomeBreve': json['nomeBreve'] == null ? undefined : json['nomeBreve'],
        'codiceFornitore': json['codiceFornitore'] == null ? undefined : json['codiceFornitore'],
        'codiceProduttore': json['codiceProduttore'] == null ? undefined : json['codiceProduttore'],
        'gestioneArticolo': json['gestioneArticolo'] == null ? undefined : json['gestioneArticolo'],
        'contestoArticolo': json['contestoArticolo'] == null ? undefined : json['contestoArticolo'],
        'barCode': json['barCode'] == null ? undefined : json['barCode'],
        'costoUltimo': json['costoUltimo'] == null ? undefined : json['costoUltimo'],
        'costoMedio': json['costoMedio'] == null ? undefined : json['costoMedio'],
        'unitMisuraIntera': json['unitàMisuraIntera'] == null ? undefined : json['unitàMisuraIntera'],
        'articoloComposto': json['articoloComposto'] == null ? undefined : json['articoloComposto'],
        'stato': json['stato'] == null ? undefined : json['stato'],
        'dataInserimento': json['dataInserimento'] == null ? undefined : (new Date(json['dataInserimento'])),
        'unitMisuraMovimenti': json['unitàMisuraMovimenti'] == null ? undefined : json['unitàMisuraMovimenti'],
        'unitMisuraInventario': json['unitàMisuraInventario'] == null ? undefined : json['unitàMisuraInventario'],
        'fattoreConversioneUnitMisura': json['fattoreConversioneUnitàMisura'] == null ? undefined : json['fattoreConversioneUnitàMisura'],
        'note': json['note'] == null ? undefined : json['note'],
        'mediaFile': json['mediaFile'] == null ? undefined : ArticoloMediaFileFromJSON(json['mediaFile']),
        'contoRawVendita': json['contoRawVendita'] == null ? undefined : json['contoRawVendita'],
        'contoRawAcquisto': json['contoRawAcquisto'] == null ? undefined : json['contoRawAcquisto'],
        'distintaBase': json['distintaBase'] == null ? undefined : ((json['distintaBase'] as Array<any>).map(ComponenteFromJSON)),
    };
}

export function ArticoloToJSON(json: any): Articolo {
    return ArticoloToJSONTyped(json, false);
}

export function ArticoloToJSONTyped(value?: Articolo | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'concurrencyToken': value['concurrencyToken'],
        'categoriaMerceologicaId': value['categoriaMerceologicaId'],
        'categoriaMerceologica': CategoriaMerceologicaToJSON(value['categoriaMerceologica']),
        'gruppoMerceologicoId': value['gruppoMerceologicoId'],
        'gruppoMerceologico': GruppoMerceologicoToJSON(value['gruppoMerceologico']),
        'causaleIvaId': value['causaleIvaId'],
        'causaleIva': CausaleIvaToJSON(value['causaleIva']),
        'tagliaId': value['tagliaId'],
        'taglia': TagliaToJSON(value['taglia']),
        'marcaId': value['marcaId'],
        'marca': MarcaToJSON(value['marca']),
        'produttoreId': value['produttoreId'],
        'produttore': ProduttoreToJSON(value['produttore']),
        'repartoId': value['repartoId'],
        'reparto': RepartoToJSON(value['reparto']),
        'nome': value['nome'],
        'codice': value['codice'],
        'nomeBreve': value['nomeBreve'],
        'codiceFornitore': value['codiceFornitore'],
        'codiceProduttore': value['codiceProduttore'],
        'gestioneArticolo': value['gestioneArticolo'],
        'contestoArticolo': value['contestoArticolo'],
        'barCode': value['barCode'],
        'costoUltimo': value['costoUltimo'],
        'costoMedio': value['costoMedio'],
        'unitàMisuraIntera': value['unitMisuraIntera'],
        'articoloComposto': value['articoloComposto'],
        'stato': value['stato'],
        'dataInserimento': value['dataInserimento'] == null ? undefined : ((value['dataInserimento'] as any).toISOString()),
        'unitàMisuraMovimenti': value['unitMisuraMovimenti'],
        'unitàMisuraInventario': value['unitMisuraInventario'],
        'fattoreConversioneUnitàMisura': value['fattoreConversioneUnitMisura'],
        'note': value['note'],
        'mediaFile': ArticoloMediaFileToJSON(value['mediaFile']),
        'contoRawVendita': value['contoRawVendita'],
        'contoRawAcquisto': value['contoRawAcquisto'],
        'distintaBase': value['distintaBase'] == null ? undefined : ((value['distintaBase'] as Array<any>).map(ComponenteToJSON)),
    };
}

