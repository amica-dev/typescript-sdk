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
import type { Magazzino } from './Magazzino';
import {
    MagazzinoFromJSON,
    MagazzinoFromJSONTyped,
    MagazzinoToJSON,
    MagazzinoToJSONTyped,
} from './Magazzino';
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
import type { DatiAggiuntivi } from './DatiAggiuntivi';
import {
    DatiAggiuntiviFromJSON,
    DatiAggiuntiviFromJSONTyped,
    DatiAggiuntiviToJSON,
    DatiAggiuntiviToJSONTyped,
} from './DatiAggiuntivi';
import type { Listino } from './Listino';
import {
    ListinoFromJSON,
    ListinoFromJSONTyped,
    ListinoToJSON,
    ListinoToJSONTyped,
} from './Listino';
import type { Articolo } from './Articolo';
import {
    ArticoloFromJSON,
    ArticoloFromJSONTyped,
    ArticoloToJSON,
    ArticoloToJSONTyped,
} from './Articolo';

/**
 * Bene o servizio fatturato.
 * @export
 * @interface BeneServizio
 */
export interface BeneServizio {
    /**
     * Identificativo univoco.
     * @type {number}
     * @memberof BeneServizio
     */
    id?: number;
    /**
     * Il token di concorrenza implementa il controllo di concorrenza ottimistica: a ogni operazione di aggiornamento o cancellazione il valore del token sul database viene confrontato con quello sull'entità. Se i valori coincidono, l'operazione viene eseguita; se differiscono, si assume che un altro utente abbia effettuato una scrittura nel frattempo e l'aggiornamento viene rifiutato.
     * @type {number}
     * @memberof BeneServizio
     */
    concurrencyToken?: number;
    /**
     * Identificativo univoco del Amica.Documento (documento).
     * @type {number}
     * @memberof BeneServizio
     */
    documentoId?: number;
    /**
     * Identificativo univoco dell'Amica.BeneServizio.Articolo (articolo o prodotto).
     * @type {number}
     * @memberof BeneServizio
     */
    articoloId?: number | null;
    /**
     * 
     * @type {Articolo}
     * @memberof BeneServizio
     */
    articolo?: Articolo;
    /**
     * Identificativo univoco della Amica.BeneServizio.Prestazione (prestazione).
     * @type {number}
     * @memberof BeneServizio
     */
    prestazioneId?: number | null;
    /**
     * 
     * @type {Articolo}
     * @memberof BeneServizio
     */
    prestazione?: Articolo;
    /**
     * Identificativo univoco del Amica.BeneServizio.Magazzino (magazzino). Obbligatorio quando viene usato Amica.BeneServizio.Codice.
     * @type {number}
     * @memberof BeneServizio
     */
    magazzinoId?: number | null;
    /**
     * 
     * @type {Magazzino}
     * @memberof BeneServizio
     */
    magazzino?: Magazzino;
    /**
     * Identificativo univoco della Amica.BeneServizio.CausaleIva.
     * @type {number}
     * @memberof BeneServizio
     */
    causaleIvaId?: number | null;
    /**
     * 
     * @type {CausaleIva}
     * @memberof BeneServizio
     */
    causaleIva?: CausaleIva;
    /**
     * Identificativo univoco del Amica.BeneServizio.Listino (listino).
     * @type {number}
     * @memberof BeneServizio
     */
    listinoId?: number | null;
    /**
     * 
     * @type {Listino}
     * @memberof BeneServizio
     */
    listino?: Listino;
    /**
     * Identificativo univoco del Amica.Documento (ordine).
     * @type {number}
     * @memberof BeneServizio
     */
    ordineId?: number | null;
    /**
     * Identificativo univoco del Amica.BeneServizio (bene o servizio) all'interno dell'ordine referenziato da Amica.BeneServizio.OrdineId.
     * @type {number}
     * @memberof BeneServizio
     */
    beneServizioOrdineId?: number | null;
    /**
     * Identificativo univoco della Amica.BeneServizio.Taglia (taglia).
     * @type {number}
     * @memberof BeneServizio
     */
    tagliaId?: number | null;
    /**
     * 
     * @type {Taglia}
     * @memberof BeneServizio
     */
    taglia?: Taglia;
    /**
     * Indica se al bene o servizio deve essere applicata una ritenuta fiscale. `true` se deve essere applicata, `false` altrimenti.
     * @type {boolean}
     * @memberof BeneServizio
     */
    ritenutaFiscale?: boolean;
    /**
     * Indice di riga all'interno del documento. Questa proprietà è utilizzata solo dal client desktop Amica 20 per Windows e deve essere considerata obsoleta.
     * @type {number}
     * @memberof BeneServizio
     */
    posizione?: number;
    /**
     * Codice del bene o servizio.
     * @type {string}
     * @memberof BeneServizio
     */
    codice?: string | null;
    /**
     * Descrizione.
     * @type {string}
     * @memberof BeneServizio
     */
    descrizione: string;
    /**
     * Unità di misura.
     * @type {string}
     * @memberof BeneServizio
     */
    unitMisura?: string | null;
    /**
     * Quantità movimentata.
     * @type {number}
     * @memberof BeneServizio
     */
    quantit?: number | null;
    /**
     * Quantità dell'ordine evasa.
     * Questo valore viene aggiornato automaticamente quando viene emessa una fattura o un DDT che contiene un riferimento a un ordine ed è attivo <a href="https://gestionaleamica.com/Software/GestioneOrdiniPreventivi">Ordini e Preventivi</a>.
     * @type {number}
     * @memberof BeneServizio
     */
    quantitEvasa?: number;
    /**
     * Quantità che resta da evadere.
     * @type {number}
     * @memberof BeneServizio
     */
    readonly quantitDaEvadere?: number;
    /**
     * Primo sconto percentuale, applicato al prezzo del bene o servizio.
     * @type {number}
     * @memberof BeneServizio
     */
    sconto1?: number | null;
    /**
     * Secondo sconto percentuale, applicato dopo l'applicazione di Amica.BeneServizio.Sconto1
     * @type {number}
     * @memberof BeneServizio
     */
    sconto2?: number | null;
    /**
     * Terzo sconto percentuale, applicato dopo l'applicazione di Amica.BeneServizio.Sconto2
     * @type {number}
     * @memberof BeneServizio
     */
    sconto3?: number | null;
    /**
     * Quarto sconto percentuale, applicato dopo l'applicazione di Amica.BeneServizio.Sconto3
     * @type {number}
     * @memberof BeneServizio
     */
    sconto4?: number | null;
    /**
     * Sconto incondizionato, in valuta, applicato al prezzo del bene o servizio.
     * @type {number}
     * @memberof BeneServizio
     */
    scontoIncondizionato?: number | null;
    /**
     * Provvigione corrisposta all'agente, in percentuale.
     * @type {number}
     * @memberof BeneServizio
     */
    provvigioneAgente?: number | null;
    /**
     * Provvigione corrisposta al capo area, in percentuale.
     * @type {number}
     * @memberof BeneServizio
     */
    provvigioneCapoArea?: number | null;
    /**
     * Identificativo univoco del Amica.BeneServizio.Prezzo (prezzo).
     * @type {number}
     * @memberof BeneServizio
     */
    prezzoId?: number | null;
    /**
     * Prezzo.
     * @type {number}
     * @memberof BeneServizio
     */
    prezzo?: number | null;
    /**
     * Prezzo scontato, cioè al netto degli sconti percentuali indicati e dello sconto incondizionato.
     * @type {number}
     * @memberof BeneServizio
     */
    prezzoScontato?: number | null;
    /**
     * Prezzo comprensivo di IVA.
     * @type {number}
     * @memberof BeneServizio
     */
    prezzoIvato?: number | null;
    /**
     * Importo, determinato come prodotto di Amica.BeneServizio.Quantità e Amica.BeneServizio.PrezzoScontato.
     * @type {number}
     * @memberof BeneServizio
     */
    importo?: number | null;
    /**
     * 
     * @type {DatiAggiuntivi}
     * @memberof BeneServizio
     */
    datiAggiuntivi?: DatiAggiuntivi;
    /**
     * Descrizione di tutti gli sconti combinati (es: "10,5%+5€").
     * @type {string}
     * @memberof BeneServizio
     */
    readonly sconto?: string | null;
}

/**
 * Check if a given object implements the BeneServizio interface.
 */
export function instanceOfBeneServizio(value: object): value is BeneServizio {
    if (!('descrizione' in value) || value['descrizione'] === undefined) return false;
    return true;
}

export function BeneServizioFromJSON(json: any): BeneServizio {
    return BeneServizioFromJSONTyped(json, false);
}

export function BeneServizioFromJSONTyped(json: any, ignoreDiscriminator: boolean): BeneServizio {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'concurrencyToken': json['concurrencyToken'] == null ? undefined : json['concurrencyToken'],
        'documentoId': json['documentoId'] == null ? undefined : json['documentoId'],
        'articoloId': json['articoloId'] == null ? undefined : json['articoloId'],
        'articolo': json['articolo'] == null ? undefined : ArticoloFromJSON(json['articolo']),
        'prestazioneId': json['prestazioneId'] == null ? undefined : json['prestazioneId'],
        'prestazione': json['prestazione'] == null ? undefined : ArticoloFromJSON(json['prestazione']),
        'magazzinoId': json['magazzinoId'] == null ? undefined : json['magazzinoId'],
        'magazzino': json['magazzino'] == null ? undefined : MagazzinoFromJSON(json['magazzino']),
        'causaleIvaId': json['causaleIvaId'] == null ? undefined : json['causaleIvaId'],
        'causaleIva': json['causaleIva'] == null ? undefined : CausaleIvaFromJSON(json['causaleIva']),
        'listinoId': json['listinoId'] == null ? undefined : json['listinoId'],
        'listino': json['listino'] == null ? undefined : ListinoFromJSON(json['listino']),
        'ordineId': json['ordineId'] == null ? undefined : json['ordineId'],
        'beneServizioOrdineId': json['beneServizioOrdineId'] == null ? undefined : json['beneServizioOrdineId'],
        'tagliaId': json['tagliaId'] == null ? undefined : json['tagliaId'],
        'taglia': json['taglia'] == null ? undefined : TagliaFromJSON(json['taglia']),
        'ritenutaFiscale': json['ritenutaFiscale'] == null ? undefined : json['ritenutaFiscale'],
        'posizione': json['posizione'] == null ? undefined : json['posizione'],
        'codice': json['codice'] == null ? undefined : json['codice'],
        'descrizione': json['descrizione'],
        'unitMisura': json['unitàMisura'] == null ? undefined : json['unitàMisura'],
        'quantit': json['quantità'] == null ? undefined : json['quantità'],
        'quantitEvasa': json['quantitàEvasa'] == null ? undefined : json['quantitàEvasa'],
        'quantitDaEvadere': json['quantitàDaEvadere'] == null ? undefined : json['quantitàDaEvadere'],
        'sconto1': json['sconto1'] == null ? undefined : json['sconto1'],
        'sconto2': json['sconto2'] == null ? undefined : json['sconto2'],
        'sconto3': json['sconto3'] == null ? undefined : json['sconto3'],
        'sconto4': json['sconto4'] == null ? undefined : json['sconto4'],
        'scontoIncondizionato': json['scontoIncondizionato'] == null ? undefined : json['scontoIncondizionato'],
        'provvigioneAgente': json['provvigioneAgente'] == null ? undefined : json['provvigioneAgente'],
        'provvigioneCapoArea': json['provvigioneCapoArea'] == null ? undefined : json['provvigioneCapoArea'],
        'prezzoId': json['prezzoId'] == null ? undefined : json['prezzoId'],
        'prezzo': json['prezzo'] == null ? undefined : json['prezzo'],
        'prezzoScontato': json['prezzoScontato'] == null ? undefined : json['prezzoScontato'],
        'prezzoIvato': json['prezzoIvato'] == null ? undefined : json['prezzoIvato'],
        'importo': json['importo'] == null ? undefined : json['importo'],
        'datiAggiuntivi': json['datiAggiuntivi'] == null ? undefined : DatiAggiuntiviFromJSON(json['datiAggiuntivi']),
        'sconto': json['sconto'] == null ? undefined : json['sconto'],
    };
}

export function BeneServizioToJSON(json: any): BeneServizio {
    return BeneServizioToJSONTyped(json, false);
}

export function BeneServizioToJSONTyped(value?: Omit<BeneServizio, 'quantitàDaEvadere'|'sconto'> | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'concurrencyToken': value['concurrencyToken'],
        'documentoId': value['documentoId'],
        'articoloId': value['articoloId'],
        'articolo': ArticoloToJSON(value['articolo']),
        'prestazioneId': value['prestazioneId'],
        'prestazione': ArticoloToJSON(value['prestazione']),
        'magazzinoId': value['magazzinoId'],
        'magazzino': MagazzinoToJSON(value['magazzino']),
        'causaleIvaId': value['causaleIvaId'],
        'causaleIva': CausaleIvaToJSON(value['causaleIva']),
        'listinoId': value['listinoId'],
        'listino': ListinoToJSON(value['listino']),
        'ordineId': value['ordineId'],
        'beneServizioOrdineId': value['beneServizioOrdineId'],
        'tagliaId': value['tagliaId'],
        'taglia': TagliaToJSON(value['taglia']),
        'ritenutaFiscale': value['ritenutaFiscale'],
        'posizione': value['posizione'],
        'codice': value['codice'],
        'descrizione': value['descrizione'],
        'unitàMisura': value['unitMisura'],
        'quantità': value['quantit'],
        'quantitàEvasa': value['quantitEvasa'],
        'sconto1': value['sconto1'],
        'sconto2': value['sconto2'],
        'sconto3': value['sconto3'],
        'sconto4': value['sconto4'],
        'scontoIncondizionato': value['scontoIncondizionato'],
        'provvigioneAgente': value['provvigioneAgente'],
        'provvigioneCapoArea': value['provvigioneCapoArea'],
        'prezzoId': value['prezzoId'],
        'prezzo': value['prezzo'],
        'prezzoScontato': value['prezzoScontato'],
        'prezzoIvato': value['prezzoIvato'],
        'importo': value['importo'],
        'datiAggiuntivi': DatiAggiuntiviToJSON(value['datiAggiuntivi']),
    };
}

