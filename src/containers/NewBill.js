import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
  /*
  * Corrigé le 11/06/202; ticket Bills [BUG REPORT]
  **/
    // On set le disabler à true, on part du principe que le fichier est bon.
    this.disabler = true;

    this.valueInput = this.document.querySelector(`input[data-testid="file"]`).value

    new Logout({ document, localStorage, onNavigate })
  }


  handleChangeFile = e => {
    e.preventDefault()
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length-1]
    const isValidPath = filePath[2] // Récupération du 3è elt du tableau, qui est le nom du fichier avec son extension.

    const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i; // Création de la regex


    if (!allowedExtensions.exec(isValidPath)) { // Execution de la regex, disabler passe à false
      this.valueInput = '';
      console.log('MAUVAIS');
      console.log(this.valueInput)
      console.log('----------')
      this.disabler = false
      return
    }
    this.disabler = true;
    if(this.disabler){ // Si disabler est true, on créé le formulaire
    const formData = new FormData()
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', file)
    formData.append('email', email)
    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {

        console.log(fileUrl)
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
      }).catch(error => console.error(error))
    
  }
}

  handleSubmit = e => {
    e.preventDefault()

    if(!this.disabler){ // Si disabler est faux, alors on vide l'input, et on return pour ne pas envoyer la requête
      let $inputFile = this.document.querySelector(`input[data-testid="file"]`) // On re-récupère l'élément input puis on le vide avec null
      $inputFile.value = null;
      return
    }

    console.log(this.fileUrl)

    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    console.log(bill.fileName)

    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  /* istanbul ignore next */
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}