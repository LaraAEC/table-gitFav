import { GithubUser } from "./GithubUser.js"


//2- classe que vai conter a lógica dos dados
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()

    GithubUser.search('LaraAEC').then(user => console.log(user))
    //classe estática não tem constructor e não precisa do new, usa logo o método.
    //esse método retorna uma promessa, continuamos a cadeia do then fora do fetch.
     
  }

  load() {
      //constante que guarda array contendo objetos com as entradas de dados.
      //armazenados no Localstore e utilizando o json.parse() para tirar o dado da string.
    const entries = JSON.parse(localStorage.getItem
      ('@github-favorites:')) || []
    
    this.entries = entries
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries)) //stringfy transforma o dado em string json.
  }

  //await = promessa, para usá-lo preciso colocar o async que vem de assíncrono.
  //função assícncrona foi tyransformada em uma promessa, e pode continuar then fora daqui.
  async add(username) {
    try {

      const userExists = this.entries.find(entry => entry.login === username)
      console.log(userExists)

      if(userExists) {
        throw new Error('Usuário já cadastrado')
      }

      const user = await GithubUser.search(username) //ele aguarda essa busca acabar para seguir para a próxima linha.

      if(user.login === undefined) {
        throw new Error('Usuário não encontrado')
      } 

      //adiciona o usuário que puxei do github, e vou trazer de volta espalhando as entries que tinha antes
      //preserva a imutabilidade temos um novo array
      //this.entries.push(user) -> quebra a imutabilidade pois usaria o mesmo array e colocando o novo usuário lá dentro.
      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch(error) {
      alert(error.message)
    }
  }

  delete(user) {
    //Higher-order functions (map, 'filter', find, reduce). Seguem o princ. da Imutabilidade.
    //.filter(function que retorna bolean) = se colocar falso ele elimina do array; se for true ele mantém no array.
    const filteredEntries = this.entries
     .filter(entry => entry.login !== user.login)
    
    this.entries = filteredEntries
    this.update()
    this.save()
  }
}


//3- classe que vai criar a visualização e eventos do HTML.
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector("table tbody")

    this.update()
    this.onadd() 
  }

  onadd() {
    const addButton = this.root.querySelector('.search button')

    window.document.onkeyup = event => {
      if(event.key === "Enter"){ 
        const { value } = this.root.querySelector('.search input')
        this.add(value)
      }
    }

    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')
      this.add(value)
    }
  }

  update() {
    this.removeAllTr()

    const empty = this.root.querySelector('.empty')
    const lengthEntries = this.entries.length
    if(lengthEntries == 0) {
      const rowNoFavorite = this.createNoFavorite()

      rowNoFavorite.querySelector('.empty img').src = 'assets/star.svg'
      rowNoFavorite.querySelector('.empty img').alt = 'Desenho de uma estrela com rosto surpreso'
      rowNoFavorite.querySelector('.empty p').textContent = 'Nenhum favorito ainda'

      this.tbody.append(rowNoFavorite)
    }

    this.entries.forEach(user => {
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      /*adição de evento com onclick qndo é só um evento de clique nesse elemento,
      se fosse mais de um usaria addEventListener.*/
      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar essa linha?') //dado boolean, responde verdadeiro ou falso
        if(isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row) //colocando a linha na tabela
    })
  }

  createRow() {
    //o tr (elemento HTML) precisa ser criado com a DOM
    const tr = document.createElement('tr') 
    
    //posso colocar dentro de template: dados
    const content = `
      <td class="user">
        <img src="https://github.com/LaraAEC.png" alt="Imagem de LaraAEC">
        <a href="https://github.com/LaraAEC" target="_blank">
          <p>Larissa Adler</p>
          <span>LaraAEC</span>
        </a>
      </td>
      <td class="repositories">
        1000
      </td>
      <td class="followers">
        2000
      </td>
      <td>
        <button class="remove">Remover</button>
      </td>
    `
    tr.innerHTML = content
    return tr
    }

    createNoFavorite() {
      const trnoFavorite = document.createElement('tr') 
      
      const contentNoFavorite = `
      <td></td>  
      <td class="empty"><img src="assets/star.svg" alt="Desenho de uma estrela com rosto surpreso"></td>
      <td class="empty">
        <p>Nenhum favorito ainda</p>
      </td>
      <td></td>
      `
      trnoFavorite.innerHTML = contentNoFavorite
      return trnoFavorite
      }
  
  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach((tr) => {
      tr.remove()
    })
  }

}          
    
    
    
    