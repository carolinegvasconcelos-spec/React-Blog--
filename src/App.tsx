import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Post = {
  id: string
  title: string
  content: string
  author: string
  authorSlug: string
  date: string
}

type Comment = {
  id: string
  postId: string
  name: string
  email: string
  text: string
  approved: boolean
}

const seedPosts: Post[] = [
  {
    id: 'rotina-de-pele',
    title: 'Uma rotina de pele que cabe na vida',
    content: 'Cuidar da pele não precisa começar com uma prateleira cheia. Uma rotina simples, feita com constância e produtos adequados às suas necessidades, pode ser um bom ponto de partida.\n\nPela manhã, limpeza suave, hidratação e proteção solar costumam formar uma base prática. À noite, remova a maquiagem e siga as instruções de uso de cada produto.\n\nSe algo causar irritação, interrompa o uso e procure orientação dermatológica. Autocuidado também é respeitar os limites da própria pele.',
    author: 'Camila Nogueira',
    authorSlug: 'camila-nogueira',
    date: '24 set, 2026',
  },
  {
    id: 'protetor-solar',
    title: 'Protetor solar: cuidado de todo dia',
    content: 'A proteção solar funciona melhor quando vira hábito, não um item reservado para dias de praia. Vale escolher um produto confortável para a sua rotina e seguir as orientações do rótulo.\n\nQuantidade, reaplicação e resistência à água variam de produto para produto. Leia as instruções e considere a exposição ao sol ao longo do dia. Chapéu, sombra e roupas também ajudam a compor esse cuidado.\n\nNa dúvida sobre qual fórmula escolher, um dermatologista pode orientar uma opção adequada à sua pele.',
    author: 'Camila Nogueira',
    authorSlug: 'camila-nogueira',
    date: '17 set, 2026',
  },
  {
    id: 'maquiagem-sem-regras',
    title: 'Maquiagem leve, pele real',
    content: 'Maquiagem pode ser expressão, brincadeira ou só mais um passo da manhã. Não existe uma quantidade certa: o melhor resultado é aquele que faz sentido para você.\n\nPara um visual leve, experimente aplicar os produtos aos poucos e construir a cobertura onde preferir. Texturas e acabamentos mudam de pessoa para pessoa, então testar com calma faz parte da descoberta.\n\nE lembre-se de remover a maquiagem antes de dormir, com um produto adequado e sem esfregar a pele.',
    author: 'Camila Nogueira',
    authorSlug: 'camila-nogueira',
    date: '09 set, 2026',
  },
]

const seedComments: Comment[] = [
  { id: 'beauty-comment-one', postId: 'rotina-de-pele', name: 'Joana Lima', email: 'joana@example.com', text: 'Simplificar a rotina fez diferença para mim. Obrigada pelas dicas!', approved: true },
  { id: 'beauty-comment-two', postId: 'rotina-de-pele', name: 'Rafaela Nunes', email: 'rafaela@example.com', text: 'Gostei do lembrete de respeitar o que funciona para cada pele.', approved: true },
  { id: 'beauty-comment-three', postId: 'protetor-solar', name: 'Lia Martins', email: 'lia@example.com', text: 'Ler o rótulo e reaplicar virou parte da minha rotina.', approved: true },
]

const readStorage = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) as T : fallback
  } catch {
    return fallback
  }
}

function App() {
  const [posts, setPosts] = useState<Post[]>(() => readStorage('ritual.posts', seedPosts))
  const [comments, setComments] = useState<Comment[]>(() => readStorage('ritual.comments', seedComments))
  const [author, setAuthor] = useState<string | null>(() => localStorage.getItem('ritual.author'))
  const [path, setPath] = useState(window.location.pathname)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    localStorage.setItem('ritual.posts', JSON.stringify(posts))
  }, [posts])

  useEffect(() => {
    localStorage.setItem('ritual.comments', JSON.stringify(comments))
  }, [comments])

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = (nextPath: string) => {
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const logout = () => {
    localStorage.removeItem('ritual.author')
    setAuthor(null)
    navigate('/')
  }

  const addPost = (title: string, content: string) => {
    const id = `${title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${crypto.randomUUID()}`
    setPosts(current => [{ id, title, content, author: author ?? 'Camila Nogueira', authorSlug: 'camila-nogueira', date: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()) }, ...current])
    navigate('/painel')
    setNotice('Post publicado com sucesso.')
  }

  const updatePost = (id: string, title: string, content: string) => {
    setPosts(current => current.map(post => post.id === id ? { ...post, title, content } : post))
    navigate('/painel')
    setNotice('Alterações salvas.')
  }

  const deletePost = (id: string) => {
    if (!window.confirm('Excluir este post? Esta ação não pode ser desfeita.')) return
    setPosts(current => current.filter(post => post.id !== id))
    setComments(current => current.filter(comment => comment.postId !== id))
    setNotice('Post excluído.')
  }
  
  const reviewComment = (id: string, approved: boolean) => {
    setComments(current => approved
      ? current.map(comment => comment.id === id ? { ...comment, approved: true } : comment)
      : current.filter(comment => comment.id !== id))
    setNotice(approved ? 'Comentário aprovado.' : 'Comentário recusado.')
  }

  const routeParts = path.split('/').filter(Boolean)
  const routePostId = routeParts[0] === 'post' ? routeParts[1] : routeParts[0] === 'painel' && routeParts[1] === 'editar' ? routeParts[2] : undefined
  const selectedPost = routePostId ? posts.find(post => post.id === routePostId) : undefined

  const renderHeader = () => (
    <header className="site-header">
      <button className="wordmark" onClick={() => navigate('/')} aria-label="Ritual de Beleza, página inicial">ritual de beleza<span>.</span></button>
      <p className="header-note">pele · maquiagem · autocuidado</p>
      <nav aria-label="Navegação principal">
        {author ? <><button className="nav-link" onClick={() => navigate('/painel')}>Meu painel</button><button className="nav-link" onClick={logout}>Sair</button></> : <button className="nav-link" onClick={() => navigate('/login')}>Área do autor <span aria-hidden="true">↗</span></button>}
      </nav>
    </header>
  )

  const renderFooter = () => <footer className="site-footer"><span>ritual de beleza<span className="accent">.</span></span><span>Beleza no seu tempo, do seu jeito.</span><span>© 2026</span></footer>

  const renderPostCard = (post: Post, index: number) => (
    <article className="post-card" key={post.id} style={{ animationDelay: `${index * 70}ms` }}>
      <div className="post-meta"><span>{post.date}</span><span className="meta-dot" aria-hidden="true">·</span><button className="author-link" onClick={() => navigate(`/autor/${post.authorSlug}`)}>{post.author}</button></div>
      <button className="post-title" onClick={() => navigate(`/post/${post.id}`)}>{post.title}</button>
      <p className="post-excerpt">{post.content.split('\n')[0]}</p>
      <button className="read-link" onClick={() => navigate(`/post/${post.id}`)}>Continuar leitura <span aria-hidden="true">→</span></button>
    </article>
  )

  const renderHome = (authorSlug?: string) => {
    const filteredPosts = authorSlug ? posts.filter(post => post.authorSlug === authorSlug) : posts
    const pageAuthor = filteredPosts[0]?.author
    return <>
      <section className="intro-band">
        <div className="intro-copy"><p className="eyebrow">PELE · MAQUIAGEM · AUTOCUIDADO</p><h1>{authorSlug ? <>Dicas de<br /><em>{pageAuthor ?? 'beleza'}</em></> : <>Beleza no seu<br /><em>próprio ritmo.</em></>}</h1><p className="intro-description">Conversas honestas sobre cosméticos, cuidado com a pele e beleza sem regras.</p></div>
        <figure className="hero-photo"><img src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85" alt="Produtos de cuidado facial em uma composição botânica" /><figcaption>RITUAIS DE CUIDADO</figcaption></figure>
      </section>
      <section className="feed-section" aria-label={authorSlug ? `Posts de ${pageAuthor}` : 'Posts recentes'}>
        <div className="section-heading"><div><p className="eyebrow">{authorSlug ? 'ARQUIVO DA AUTORA' : 'NA ROTINA'}</p><h2>{authorSlug ? 'Todos os artigos' : 'Dicas recentes'}</h2></div><span className="post-count">{String(filteredPosts.length).padStart(2, '0')} artigos</span></div>
        {filteredPosts.length ? <div className="post-list">{filteredPosts.map(renderPostCard)}</div> : <div className="empty-state">Ainda não há textos por aqui.</div>}
      </section>
    </>
  }

  const renderPost = (post: Post) => {
    const approvedComments = comments.filter(comment => comment.postId === post.id && comment.approved)
    const submitComment = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const formData = new FormData(event.currentTarget)
      const name = String(formData.get('name')).trim()
      const email = String(formData.get('email')).trim()
      const text = String(formData.get('comment')).trim()
      if (!name || !email || !text) return
      setComments(current => [...current, { id: `comment-${Date.now()}`, postId: post.id, name, email, text, approved: false }])
      event.currentTarget.reset()
      setNotice('Comentário enviado. Ele aparecerá após aprovação.')
    }
    return <article className="article-page">
      <button className="back-link" onClick={() => navigate('/')}>← Voltar aos textos</button>
      <div className="article-meta"><span>{post.date}</span><span aria-hidden="true">·</span><button className="author-link" onClick={() => navigate(`/autor/${post.authorSlug}`)}>{post.author}</button></div>
      <h1>{post.title}</h1>
      <div className="article-rule" />
      <div className="article-content">{post.content.split('\n').filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
      <section className="comments-section"><div className="section-heading"><div><p className="eyebrow">CONVERSA</p><h2>Comentários <span className="comment-count">{approvedComments.length}</span></h2></div></div>
        <div className="comment-list">{approvedComments.length ? approvedComments.map(comment => <article className="comment" key={comment.id}><div className="comment-byline"><strong>{comment.name}</strong><span>Leitor(a)</span></div><p>{comment.text}</p></article>) : <p className="empty-comments">Seja a primeira pessoa a comentar.</p>}</div>
        <form className="comment-form" onSubmit={submitComment}><h3>Deixe uma impressão</h3><div className="form-row"><label>Seu nome<input name="name" required maxLength={80} /></label><label>Seu e-mail<input name="email" type="email" required maxLength={160} /></label></div><label>Comentário<textarea name="comment" required rows={4} maxLength={1000} /></label><div className="form-submit"><span>Comentários são publicados após aprovação.</span><button className="button button-dark" type="submit">Enviar comentário <span aria-hidden="true">→</span></button></div></form>
      </section>
    </article>
  }

  const renderLogin = () => {
    const submitLogin = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const formData = new FormData(event.currentTarget)
      if (formData.get('email') === 'editora@ritualdebeleza.blog' && formData.get('password') === 'beleza2026') {
        localStorage.setItem('ritual.author', 'Camila Nogueira')
        setAuthor('Camila Nogueira')
        navigate('/painel')
      } else setNotice('E-mail ou senha incorretos.')
    }
    return <section className="login-page"><div className="login-copy"><p className="eyebrow">ESPAÇO DA EDITORA</p><h1>Seu próximo<br /><em>ritual começa aqui.</em></h1><p>Entre para compartilhar seus cuidados, descobertas e favoritos.</p></div><form className="login-form" onSubmit={submitLogin}><h2>Acessar painel</h2><label>E-mail<input name="email" type="email" autoComplete="username" required /></label><label>Senha<input name="password" type="password" autoComplete="current-password" required /></label><button className="button button-dark" type="submit">Entrar <span aria-hidden="true">→</span></button><p className="demo-credentials">Acesso de demonstração<br /><strong>editora@ritualdebeleza.blog</strong><br />senha: <strong>beleza2026</strong></p></form></section>
  }

  const renderDashboard = () => {
    const ownPosts = posts.filter(post => post.author === author)
    const pendingComments = comments.filter(comment => !comment.approved && ownPosts.some(post => post.id === comment.postId))
    const editMatch = path.match(/^\/painel\/editar\/([^/]+)$/)
    const postToEdit = editMatch ? posts.find(post => post.id === editMatch[1] && post.author === author) : undefined
    const creating = path === '/painel/novo'
    if ((creating || editMatch) && (!creating && !postToEdit)) return <section className="empty-state">Este post não está disponível. <button className="read-link" onClick={() => navigate('/painel')}>Voltar ao painel</button></section>
    if (creating || postToEdit) return <PostEditor post={postToEdit} onSave={(title, content) => postToEdit ? updatePost(postToEdit.id, title, content) : addPost(title, content)} onCancel={() => navigate('/painel')} />
    return <section className="dashboard">
      <div className="dashboard-heading"><div><p className="eyebrow">ESPAÇO DA EDITORA</p><h1>Seu espaço,<br /><em>seu olhar.</em></h1><p className="dashboard-welcome">Olá, {author}. Aqui estão seus artigos de beleza.</p></div><button className="button button-dark" onClick={() => navigate('/painel/novo')}>＋ Novo artigo</button></div>
      <div className="section-heading"><div><p className="eyebrow">PUBLICAÇÕES</p><h2>Meus artigos</h2></div><span className="post-count">{String(ownPosts.length).padStart(2, '0')} artigos</span></div>
      {notice && <p className="inline-notice">{notice}</p>}
      {ownPosts.length ? <div className="dashboard-list">{ownPosts.map(post => <article className="dashboard-row" key={post.id}><div><span className="post-date">{post.date}</span><button className="dashboard-title" onClick={() => navigate(`/post/${post.id}`)}>{post.title}</button></div><div className="row-actions"><button className="text-action" onClick={() => navigate(`/painel/editar/${post.id}`)}>Editar</button><button className="text-action text-danger" onClick={() => deletePost(post.id)}>Excluir</button></div></article>)}</div> : <div className="empty-state">Seu primeiro artigo ainda está esperando. <button className="read-link" onClick={() => navigate('/painel/novo')}>Escrever artigo →</button></div>}
      <section className="moderation-section"><div className="section-heading"><div><p className="eyebrow">PARTICIPAÇÃO</p><h2>Comentários para revisar</h2></div><span className="post-count">{String(pendingComments.length).padStart(2, '0')} pendentes</span></div>
        {pendingComments.length ? <div className="pending-list">{pendingComments.map(comment => {
          const relatedPost = ownPosts.find(post => post.id === comment.postId)
          return <article className="pending-comment" key={comment.id}><div className="pending-byline"><div><strong>{comment.name}</strong><span>{comment.email}</span></div><small>em {relatedPost?.title}</small></div><p>{comment.text}</p><div className="row-actions"><button className="text-action" onClick={() => reviewComment(comment.id, true)}>Aprovar</button><button className="text-action text-danger" onClick={() => reviewComment(comment.id, false)}>Recusar</button></div></article>
        })}</div> : <p className="empty-comments">Não há comentários aguardando revisão.</p>}
      </section>
    </section>
  }

  let page: React.ReactNode
  if (path === '/login') page = author ? renderDashboard() : renderLogin()
  else if (path.startsWith('/painel')) page = author ? renderDashboard() : renderLogin()
  else if (path.startsWith('/post/')) page = selectedPost ? renderPost(selectedPost) : <div className="empty-state">Este texto não foi encontrado. <button className="read-link" onClick={() => navigate('/')}>Voltar ao início</button></div>
  else if (path.startsWith('/autor/')) page = renderHome(routeParts[1])
  else page = renderHome()
  return (
    <div className="app-shell">
      {renderHeader()}
      <main>{notice && path !== '/painel' && <p className="toast" role="status">{notice}</p>}{page}</main>
      {renderFooter()}
    </div>
  )
}

function PostEditor({ post, onSave, onCancel }: { post?: Post; onSave: (title: string, content: string) => void; onCancel: () => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    onSave(String(data.get('title')).trim(), String(data.get('content')).trim())
  }
  return <section className="editor-page"><button className="back-link" onClick={onCancel}>← Voltar ao painel</button><p className="eyebrow">{post ? 'EDIÇÃO' : 'NOVO TEXTO'}</p><h1>{post ? 'Revisar palavras.' : <>Uma ideia<br /><em>ganha forma.</em></>}</h1><form className="editor-form" onSubmit={submit}><label>Título<input name="title" required maxLength={120} defaultValue={post?.title} placeholder="Dê um título ao seu texto" /></label><label>Conteúdo<textarea name="content" required rows={14} defaultValue={post?.content} placeholder="Escreva com calma..." /></label><div className="form-submit"><span>Seu texto ficará visível para todos.</span><div className="editor-actions"><button className="button button-light" type="button" onClick={onCancel}>Cancelar</button><button className="button button-dark" type="submit">{post ? 'Salvar alterações' : 'Publicar texto'} <span aria-hidden="true">→</span></button></div></div></form></section>
}

export default App
