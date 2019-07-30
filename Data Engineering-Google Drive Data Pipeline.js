function scan_files() {
  var folder = DriveApp.getFolderById(folderID);
  var processedfolder = DriveApp.getFolderById(processedfolderId);
  var files = folder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    if (file.getName().substring(0, 10) != 'processed_' || file.getName().substring(0, 7) != 'loaded_') {
      loadCSVfromdrive(file);
    }
  }
};

function loadCSVfromdrive(file) {
  var fileId = file.getId();
  var filename = file.getName();
  var csvData =Utilities.parseCsv(file.getBlob().getDataAsString());
  var headers = [list of headers];
  var length = csvData.length;
// defining an array for each row of data
  abstractarray = [headers];
//looping through each row of data from the raw file , transforming it and append it to the array
  for (var a = 1; a < csvData.length; a++){

// Transformation of data begins here (example below)
  var description = csvData[a][14] + " " + csvData[a][25] + " " + csvData[a][26] + " " + csvData[a][27]; 
  var reference = csvData[a][15];
  var transaction_type = csvData[a][21];
// Transformation of data ends here
  contents = [description, reference, transaction_type];
  abstractarray.push(contents);
  }
// defining the contents of the csv, should be an array of arrays
  var csvContent = '';
  abstractarray.forEach(function(infoarray, index) {
    dataString = infoarray.join(',');
    csvContent += index < abstractarray.length ? dataString + '\n'    :dataString;
    });
// create a csv file which contents are the csv contents we defined in the processed folder   
  filename_new = 'processed_' + filename
  file_new = processedfolder.createFile(filename_new, csvContent);

// Create the data upload job.
  var job = {
    configuration: {
      load: {
        destinationTable: {
          projectId: projectId,
          datasetId: datasetId,
          tableId: tableId
        },
        maxBadRecords: 0,
        fieldDelimiter: ',',
        skipLeadingRows: 0,
        writeDisposition: 'WRITE_APPEND',
        sourceFormat: "CSV"
      }
    }
  };
  job = BigQuery.Jobs.insert(job, projectId, file_new);
    while(true) {
  jobstatus = BigQuery.Jobs.get(projectId, job.getJobReference().getJobId(), {location : location})
    if(jobstatus.getStatus().getState() == "DONE") {
      break;}
    }
// saving the loaded file as the name 'loaded' so that it 
//doesnt get loaded the next time
  DriveApp.getFileById(fileId).setName('loaded_' + file.getName());
  Logger.log(file_new)
}