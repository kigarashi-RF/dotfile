'use strict';

const Storage = require('@google-cloud/storage');
const BigQuery = require('@google-cloud/bigquery');

// Instantiates a client
const storage = Storage();
const bigquery = new BigQuery();

/**
 * Creates a BigQuery load job to load a file from Cloud Storage and write the data into BigQuery.
 *
 * @param {object} data The event payload.
 * @param {object} context The event metadata.
 */
exports.loadGCSFileToBQ = (data, context) => {

    // BigQuery Dataset
    const datasetId = 'article';

    // Media ID extraction
    const filename = data.name;
    const tableId  = filename.match(/\d+/);

    // Table load option
    const jobMetadata = {
        skipLeadingRows: 1,
        writeDisposition: 'WRITE_APPEND'
    };

    // Table schema
    const options = {
        schema: 'id:string,permanent_link:string,title:STRING,image_url:STRING,optional:STRING,public_dt:STRING,description:STRING'
    };

    // Table existence check
    bigquery
        .dataset(datasetId)
        .table(tableId[0])
        .exists()
        .then(results => {
          const exists = results[0];
          console.log(`Table exists : ${exists}`);
          // Create a new table in the dataset (If the table does not exist)
          if (exists === false) {
            bigquery
                .dataset(datasetId)
                .createTable(tableId[0], options)
                .then(results => {
                  const table = results[0];
                  console.log(`Table ${tableId} created.`);
                })
                .catch(err => {
                  console.error('ERROR:', err);
                });
          }
          // [END bigquery_create_table]

          // Loads data from a Google Cloud Storage file into the table
          bigquery
              .dataset(datasetId)
              .table(tableId[0])
              .load(storage.bucket(data.bucket).file(data.name), jobMetadata)
              .catch(err => {
                  console.error('ERROR:', err);
              })
          // [END bigquery_load_table]
        })
        .catch(err => {
          console.error('ERROR:', err);
        });

    console.log(`Loading from gs://${data.bucket}/${data.name} into ${datasetId}.${tableId}`);
    console.log(`TableID(MediaID): ${tableId}`);
};
