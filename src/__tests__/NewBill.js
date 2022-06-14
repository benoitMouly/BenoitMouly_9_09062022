/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import {waitFor} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockStore from "../__mocks__/store"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
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
  describe('When i fullfiled the form', () => {
    test("Then the function should can be clicked", async () => {

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
      const mockStore = '';
      const newBill = new NewBill({document, onNavigate, mockStore, localStorage: window.localStorage});
      let selectValue = screen.queryAllByTestId('expense-type')[0]
      selectValue.selectedIndex = 2;
      let nameValue = screen.queryAllByTestId('expense-name')[0]
      nameValue.value = 'Josh';
      let amount = screen.queryAllByTestId('amount')[0]
      amount.value = 20;
      let dateValue = screen.queryAllByTestId('datepicker')[0]
      let date = new Date();
      let currentDate = date.toISOString().substring(0,10);
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
    
      // const fnHandleChangeFile = jest.fn(newBill.handleChangeFile);
      // const fnHandleSubmit = newBill.handleSubmit(submitbtn)
      // const fnHandleSubmit = jest.fn(newBill.handleChangeFile(submitbtn));

      // submitbtn.addEventListener('onclick', fnHandleSubmit)
      // userEvent.click(submitbtn, {preventDefault: jest.fn()})



      // expect(fnHandleSubmit.preventDefault).toHaveBeenCalled();
      // expect(fnHandleChangeFile).toHaveBeenCalled();
      // expect(fnHandleChangeFile).toHaveBeenCalled();
      const form = screen.getByTestId('form-new-bill')
      const fnhandleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      form.addEventListener("submit", fnhandleSubmit)
      fireEvent.submit(form)
      expect(fnhandleSubmit).toHaveBeenCalled()
      expect(submitbtn).toBeTruthy()

    })
  })
})
