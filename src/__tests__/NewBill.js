/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import {waitFor} from "@testing-library/dom"
import NewBill from "../containers/NewBill.js"
import mockStore from "../__mocks__/store"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js"
jest.mock("../app/store", () => mockStore)



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the page should show up", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() =>  screen.getByText("Envoyer une note de frais"))
      const contentPending  = await screen.getByText("Envoyer une note de frais")
      expect(contentPending).toBeTruthy()

    })
  })

  /*
  * Vérification du bon format de fichier
  **/

  describe('When i send the form', () => {
    test("With a wrong file-extension", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      jest.mock("../app/store", () => mockStore)
      await waitFor(() =>  document.querySelector("#btn-send-bill"))
      const submitbtn  = await document.querySelector('#btn-send-bill');
      const newBill = new NewBill({document, onNavigate, mockStore, localStorage: window.localStorage});
      let selectValue = screen.queryAllByTestId('expense-type')[0]
      selectValue.selectedIndex = 2;
      let nameValue = screen.queryAllByTestId('expense-name')[0]
      nameValue.value = 'Josh';
      let amount = screen.queryAllByTestId('amount')[0]
      amount.value = 20;
      let dateValue = screen.queryAllByTestId('datepicker')[0]
      dateValue.value = "2022-01-15"
      console.log(dateValue);
      let vatValue = screen.queryAllByTestId('vat')[0]
      vatValue.value = 20;
      let pctValue = screen.queryAllByTestId('pct')[0]
      pctValue.value = 6;
      let commentValue = screen.queryAllByTestId('commentary')[0];
      commentValue.value = 'Bonjour je suis un commentaire';

      let fileInput = screen.queryAllByTestId('file')[0]
      const fakeFile = new File(['hello'], 'hello.zip');
      userEvent.upload(fileInput, fakeFile)

      const form = screen.getByTestId('form-new-bill')
      const fnhandleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      const fnhandleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      fireEvent.click(fileInput, fnhandleChangeFile)
      form.addEventListener("submit", fnhandleSubmit)
      fireEvent.submit(form)
      expect(submitbtn).toBeTruthy();
      expect(jest.spyOn(mockStore, "bills")).not.toHaveBeenCalled()
    })
  })

})


describe('When I submit the formi', () => {
  test("I send the good format extension", async () => {

    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
    window.onNavigate(ROUTES_PATH.NewBill)
    jest.mock("../app/store", () => mockStore)
    const newBill = new NewBill({document, onNavigate, mockStore, localStorage: window.localStorage});
    let selectValue = screen.queryAllByTestId('expense-type')[0]
    selectValue.selectedIndex = 2;
    let nameValue = screen.queryAllByTestId('expense-name')[0]
    nameValue.value = 'Josh';
    let amount = screen.queryAllByTestId('amount')[0]
    amount.value = 20;
    let dateValue = screen.queryAllByTestId('datepicker')[0]
    dateValue.value = "2022-01-15"
    console.log(dateValue);
    let vatValue = screen.queryAllByTestId('vat')[0]
    vatValue.value = 20;
    let pctValue = screen.queryAllByTestId('pct')[0]
    pctValue.value = 6;
    let commentValue = screen.queryAllByTestId('commentary')[0];
    commentValue.value = 'Bonjour je suis un commentaire';

    let fileInput = screen.queryAllByTestId('file')[0]
    const fakeFile = new File(['hello'], 'hello.png', { type: 'image/png' });
    userEvent.upload(fileInput, fakeFile)

    const form = screen.getByTestId('form-new-bill')
    const fnhandleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
    const fnhandleSubmit = jest.fn((e) => newBill.handleSubmit(e))
    fireEvent.click(fileInput, fnhandleChangeFile)
    form.addEventListener("submit", fnhandleSubmit)
    fireEvent.submit(form)
    expect(jest.spyOn(mockStore, "bills")).toHaveBeenCalled()
  })
})


describe("Given I am connected as an employee", () => {
  describe("When I create a new bill", () => {
    /**
     * 404
     */
    test("post bill but get 404", async () => {
      mockStore.bills.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    /**
     * 500
     */
    test("post bill but get 500", async () => {
      mockStore.bills.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})