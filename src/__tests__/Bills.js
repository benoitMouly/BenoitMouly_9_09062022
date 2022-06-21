/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";


import userEvent from "@testing-library/user-event";
jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList).toContain('active-icon');

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML) // regex en faisant passer 'a' en parametre
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)

    })
  })

/*
* Test de la modale justificatif  au click
**/

  describe("When I click on the eye icon", () => {
    test("Then the modal as to be open", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      const mockStore = '';
      const bill = new Bills({document, onNavigate, mockStore, localStorage: window.localStorage});

      await waitFor(() => screen.queryAllByTestId('icon-eye')[0]) // On attend que le DOM affiche l'élément
      const eye_icon = screen.queryAllByTestId('icon-eye')[0]; // On sélectionne un élément de la query
      console.log(eye_icon)
      $.fn.modal = jest.fn() // espionne le comportement d'un function qui est appelée indirectement dans notre code
      const fnHandleClickIconEyes = bill.handleClickIconEye(eye_icon); // On prend la fonction du fichier bill
      eye_icon.addEventListener('onclick', fnHandleClickIconEyes)
      userEvent.click(eye_icon); // On imite le comportement de l'user
      expect( $.fn.modal).toHaveBeenCalled;
      const $justificatifText = await screen.getAllByText('Justificatif');
      expect($justificatifText).toBeDefined(); // On revérifie que la modal est bien ouverte avec le texte ('Justificatif')
      expect(fnHandleClickIconEyes).toHaveBeenCalled; // On test que tout a été espionné

    })
  })

/*
* Test du click sur le boutton ' nouvelle note de frais '
**/

  describe("When I create a new bill", () => {
    test("I trigger new bill button", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      const mockStore = '';
      const bill = new Bills({document, onNavigate, mockStore, localStorage: window.localStorage});

      await waitFor(() => screen.getAllByTestId('btn-new-bill')) // getByTestId est actuellement buggé donc on est obligé de prendre le All
      const btn_bill = screen.getAllByTestId('btn-new-bill')[0]; // On sélectionne un élément de la query
      console.log(btn_bill)
      const fnHandleClickNewBill = jest.fn(bill.handleClickNewBill)
      btn_bill.addEventListener('onclick', fnHandleClickNewBill());
      userEvent.click(btn_bill) // on simule le click du gadjot
      expect(fnHandleClickNewBill).toHaveBeenCalled();
      const $newFormBill = await screen.getByText('Envoyer une note de frais');
      expect($newFormBill).toBeDefined() // Si $newFormBill est différent de indéfini, c'est qu'on est bon

    })
  })

/*
* Test d'un message d'erreur sur la page (exemple : vider son local storage)
**/

    describe('When I am on Bills page but receiving an error',  () => {
      test('Error page should be rendered', async () => {
        document.body.innerHTML = BillsUI({ error: 'Erreur' })
        expect(screen.getAllByText('Erreur')).toBeDefined()
      })
    })

/*
* Test si on a bien envoyé une nouvelle facture
**/

    describe("When I navigate to Billz", () => {
      test("Bills are fetched", async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
        await waitFor(() =>  screen.getByText("Mes notes de frais"))
        const contentPending  = await screen.getByText("Mes notes de frais")
        expect(contentPending).toBeTruthy()

        const table = await screen.getByTestId('tbody');
        expect(table.children).toBeTruthy() // notre table a bien des children
      })

      describe("When an error occurs on API", () => {
        beforeEach(() => {
          jest.spyOn(mockStore, "bills")
          Object.defineProperty(
              window,
              'localStorage',
              { value: localStorageMock }
          )
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee'
          }))
          const root = document.createElement("div")
          root.setAttribute("id", "root")
          document.body.appendChild(root)
          router()
        })
        test("fetches bills from an API and fails with 404 message error", async () => {
    
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list : () =>  {
                return Promise.reject(new Error("Erreur 404"))
              }
            }})
          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick);
          const message = await screen.getByText(/Erreur 404/)
          expect(message).toBeTruthy()
        })
    
        test("Error 500", async () => {
    
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list : () =>  {
                return Promise.reject(new Error("Erreur 500"))
              }
            }})
    
          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick);
          const message = await screen.getByText(/Erreur 500/)
          expect(message).toBeTruthy()
        })

      })
    })

}) // Give I'm connected as an employee
