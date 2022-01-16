const express = require('express');

const router = express.Router();

const axios = require('axios')
const pdf = require('html-pdf');
const fs = require('fs');
const PDFDocument = require('pdfkit');


const JSZip = require('jszip');
var PizZip = require("pizzip");

const { convert } = require('html-to-text');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var Docxtemplater = require("docxtemplater");
var createReport = require("docx-templates").default;


var path = require("path");




/* GET home page. */
router.post('/', async (req, res, next)=> {
  let recArray = [];
  let styleApplied = false;

  let urls = req.body.urlsList.split("\r\n").filter((e)=>e.length>0);


  // let urls = [
  //   'https://trust.yandex.ru/receipts/124-355a1b25e99f30ba89f65c74be54ae0a/#receipt_url_pdf=https://trust.yandex.ru/receipts/124-355a1b25e99f30ba89f65c74be54ae0a/?mode=pdf',
  //   'https://check.yandex.ru/mobile/?n=208637&fn=9960440300973672&fpd=2072316183#receipt_url_pdf=https://check.yandex.ru/pdf/?n=208637&fn=9960440300973672&fpd=2072316183'
  // ]

  let summ =0;
  for (const url of urls) {

    const response = await axios.get(url,
        {responseType: 'arraybuffer'}
    );

    const result = response.data
    let html = result.toString('utf8');


    const dom = new JSDOM(html);


    let rec_style = styleApplied ? "" : dom.window.document.querySelector("style").outerHTML;
    summ = summ+  parseFloat(dom.window.document.querySelector("tr.totals-row > td:nth-child(2)").textContent.replace(" ₽",""));



    let rec_txt = rec_style.concat(dom.window.document.querySelector("div.container").outerHTML);


    console.log(url);
    //console.log(rec_txt);
    //rec_txt = rec_txt.replaceAll("24px", "12px");
    recArray.push(rec_txt);
    styleApplied=!styleApplied;

  }


  res.render('index', {title: 'Электронные чеки', receipt: recArray, _urls: urls, SummInRUB:summ});

});




/* GET home page. */
router.get('/', async function(req, res, next) {
  let recArray=[];
  let styleApplied = false;

  let bodyUrls = req.body;

  let summ=0;
  let urls = [
//    'https://trust.yandex.ru/receipts/124-355a1b25e99f30ba89f65c74be54ae0a/#receipt_url_pdf=https://trust.yandex.ru/receipts/124-355a1b25e99f30ba89f65c74be54ae0a/?mode=pdf',
//     'https://check.yandex.ru/mobile/?n=208637&fn=9960440300973672&fpd=2072316183#receipt_url_pdf=https://check.yandex.ru/pdf/?n=208637&fn=9960440300973672&fpd=2072316183'
  ]


  for (const url of urls) {

  const response = await axios.get(url,
      {responseType: 'arraybuffer'}
  );

  const result = response.data
  let html =result.toString('utf8');
  const text = convert(html);
  let options = {
    "format": "A4",        // allowed units: A3, A4, A5, Legal, Letter, Tabloid
    "orientation": "portrait",
    "border": {
      "top": "0.3in",            // default is 0, units: mm, cm, in, px
      "right": "0.3in",
      "bottom": "0.3in",
      "left": "0.3in"
    }
    //"zoomFactor": "0.68"
  }


  const dom = new JSDOM(html);


  let rec_style =styleApplied ?"" : dom.window.document.querySelector("style").outerHTML;

  let rec_txt = rec_style.concat(dom.window.document.querySelector("div.container").outerHTML);

  //rec_style = rec_style.concat("<style>.container {width: 500px !important}</style>");

    console.log(url);
    //console.log(rec_txt);
    rec_txt =rec_txt.replaceAll("24px","12px");
    recArray.push(rec_txt);
  }





  // pdf.create(rec_txt,options).toStream(function(err, stream){
  //   stream.pipe(fs.createWriteStream('./foo.pdf'));
  // });


  // let pdfDoc = new PDFDocument;
  // pdfDoc.pipe(fs.createWriteStream('SampleDocument.pdf'));
  //
  // pdfDoc.text(rec_txt, 10, 10);
  //
  // pdfDoc.end();


  // Load the docx file as binary content
  // var content = fs.readFileSync(
  //     path.resolve(__dirname, "../Two_columns.docx"),
  //     "binary"
  // );
  //
  // let zip = new PizZip(content);
  // const doc = new Docxtemplater(zip);
  //doc.loadZip(zip);
// , {
//     paragraphLoop: true,
//         linebreaks: true,
//   }
// render the document
// (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
//   doc.render({
//     receipt: rec_txt
//   });
//
//   var buf = doc.getZip().generate({ type: "nodebuffer" });
//
// // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
//   fs.writeFileSync(path.resolve(__dirname, "../output.docx"), buf);
//
//
//   const template = fs.readFileSync(path.resolve(__dirname, "../Two_columns.docx"));
//
//   const buffer = await createReport({
//     template,
//     data: {
//       receipt: rec_txt
//
//     },
//   });
//
//   fs.writeFileSync('report1.docx', buffer)


  res.render('index', { title: 'Электронные чеки' , receipt:recArray , _urls:urls, SummInRUB:summ});
});

module.exports = router;
