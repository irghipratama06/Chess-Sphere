import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Chess } from 'chess.js'
import { autoConnect } from '@unicitylabs/sphere-sdk/connect/browser'
import { SPHERE_NETWORKS } from '@unicitylabs/sphere-sdk/connect'
import './style.css'

const files = ['a','b','c','d','e','f','g','h']
const glyph = {
  p:'♟', n:'♞', b:'♝', r:'♜', q:'♛', k:'♚',
  P:'♙', N:'♘', B:'♗', R:'♖', Q:'♕', K:'♔'
}

const MOVES_PER_UCT = 20

function calculateMoves(uct) {
  return Math.max(0, Math.floor(Number(uct) * MOVES_PER_UCT))
}

const leaderboard = [
  ['1','NagaTimur','1,245 UCT','98%'],
  ['2','CaturManado','980 UCT','94%'],
  ['3','SphereKing','765 UCT','91%'],
  ['4','RajaPapan','620 UCT','88%'],
  ['5','KudaEmas','510 UCT','86%'],
  ['6','PemainBaru','420 UCT','82%'],
  ['7','Benteng99','355 UCT','79%'],
  ['8','SkakMat','290 UCT','76%']
]

async function connectSphere() {
  return autoConnect({
    dapp: {
      name: 'Sphere Chess',
      url: window.location.origin,
      icon: `${window.location.origin}/icon.svg`
    },
    network: SPHERE_NETWORKS.testnet2,
    permissions: ['identity:read', 'sign:request'],
    walletUrl: 'https://sphere.unicity.network',
    silent: false
  })
}

function App() {
  const [wallet, setWallet] = useState(null)
  const [game, setGame] = useState(() => new Chess())
  const [selected, setSelected] = useState(null)
  const [stake, setStake] = useState('5')
  const [difficulty, setDifficulty] = useState('Medium')
  const [status, setStatus] = useState('Connect your Sphere Wallet to start playing.')
  const [credits, setCredits] = useState(0)
  const [tab, setTab] = useState('game')

  const board = game.board()
  const turnText = game.turn() === 'w' ? 'Your turn' : 'Computer is thinking…'
  const identity = wallet?.nametag || wallet?.directAddress || wallet?.chainPubkey || 'Connected'

  async function handleConnect() {
    setStatus('Opening Sphere Wallet…')
    try {
      const result = await connectSphere()
      setWallet(result.connection?.identity ?? result.identity ?? null)
      setStatus('Wallet connected. Enter a deposit amount to receive move credits.')
    } catch (e) {
      setStatus(e?.message || 'Sphere connection failed. Please try again.')
    }
  }

  function depositDemo() {
    if (!wallet) return setStatus('Connect your Sphere Wallet first.')
    const amount = Number(stake)
    if (!amount || amount < 5) return setStatus('Minimum deposit is 5 UCT.')
    setCredits(calculateMoves(amount))
    setStatus(`Deposit ${amount} UCT = ${calculateMoves(amount)} moves. Transaction confirmation is handled through Sphere Wallet.`)
  }

  function newGame() {
    setGame(new Chess())
    setSelected(null)
    setStatus(credits > 0 ? 'New game started. You are playing as White.' : 'Make a deposit to receive move credits.')
  }

  function makeComputerMove(nextGame) {
    const moves = nextGame.moves({ verbose: true })
    if (!moves.length) return
    const values = { p:1, n:3, b:3, r:5, q:9, k:100 }
    const scored = moves.map(m => {
      let score = Math.random() * 0.6
      if (m.san.includes('#')) score += 1000
      else if (m.san.includes('+')) score += 30
      if (m.captured) score += (values[m.captured] || 0) * 5
      if (m.promotion) score += 8
      return { m, score }
    }).sort((a,b) => b.score-a.score)
    const chosen = scored[0].m
    nextGame.move(chosen)
    setGame(new Chess(nextGame.fen()))
    if (nextGame.isCheckmate()) setStatus('Checkmate! The computer wins.')
    else if (nextGame.isDraw()) setStatus('Game ended in a draw.')
    else setStatus('Your turn.')
  }

  function clickSquare(row, col) {
    if (!wallet) return setStatus('Connect your Sphere Wallet first.')
    if (credits <= 0) return setStatus('You have no move credits. Make a UCT deposit first.')
    if (game.turn() !== 'w') return

    const square = `${files[col]}${8-row}`
    if (!selected) {
      const piece = board[row][col]
      if (piece?.color === 'w') setSelected(square)
      return
    }

    const next = new Chess(game.fen())
    try {
      next.move({ from: selected, to: square, promotion: 'q' })
      setCredits(c => Math.max(0, c - 1))
      setSelected(null)
      setGame(new Chess(next.fen()))
      if (next.isCheckmate()) {
        setStatus('You win! Checkmate.')
        return
      }
      if (next.isDraw()) {
        setStatus('Game ended in a draw.')
        return
      }
      setStatus('Computer is thinking…')
      setTimeout(() => makeComputerMove(next), difficulty === 'Hard' ? 700 : difficulty === 'Medium' ? 450 : 250)
    } catch {
      setSelected(null)
      setStatus('Invalid move.')
    }
  }

  return (
    <main>
      <header className="topbar">
        <div>
          <div className="brand">♟ <span>Sphere Chess</span></div>
          <p>Play chess against the computer using UCT Testnet</p>
        </div>
        {!wallet ? (
          <button className="primary" onClick={handleConnect}>Connect Sphere Wallet</button>
        ) : (
          <div className="wallet">✓ {String(identity).slice(0, 18)}{String(identity).length > 18 ? '…' : ''}</div>
        )}
      </header>

      <section className="hero">
        <h1>Play chess, earn move credits, and climb the leaderboard.</h1>
        <p>Connect your Sphere wallet, deposit UCT for move credits, and compete on global and weekly leaderboards. <b>50% of every weekly deposit feeds the prize pool for the top 5 players.</b></p>
      </section>

      <nav className="tabs">
        <button className={tab==='game'?'active':''} onClick={()=>setTab('game')}>♟ Game</button>
        <button className={tab==='leaderboard'?'active':''} onClick={()=>setTab('leaderboard')}>🏆 Leaderboard</button>
      </nav>

      {tab === 'game' ? (
        <>
          <section className="panel controls">
            <div className="field">
              <label>UCT Deposit</label>
              <div className="input-row"><input value={stake} onChange={e=>setStake(e.target.value)} inputMode="decimal" min="5" /><span>UCT</span></div>
              <small className="hint">5 UCT = 100 moves • 10 UCT = 200 moves</small>
            </div>
            <div className="field">
              <label>Computer Difficulty</label>
              <select value={difficulty} onChange={e=>setDifficulty(e.target.value)}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </div>
            <button disabled={!wallet} onClick={depositDemo}>Deposit & Get Credits</button>
            <button onClick={newGame}>New Game</button>
          </section>

          <div className="credit-line"><span>Move credits: <b>{credits}</b></span><span className="network">Sphere Testnet 2</span></div>
          <p className="status">{status}</p>

          <section className="game-wrap">
            <div>
              <div className="playerbar"><span>You</span><b>White</b><span>{turnText}</span></div>
              <div className="board">
                {board.map((row,r)=>row.map((cell,c)=>{
                  const sq=`${files[c]}${8-r}`
                  const dark=(r+c)%2===1
                  return <button key={sq} className={`sq ${dark?'dark':'light'} ${selected===sq?'selected':''}`} onClick={()=>clickSquare(r,c)}>
                    {cell && <span className={cell.color==='w'?'white-piece':'black-piece'}>{glyph[cell.color==='w'?cell.type.toUpperCase():cell.type]}</span>}
                  </button>
                }))}
              </div>
              <div className="playerbar"><span>Computer</span><b>Black</b><span>● Online</span></div>
            </div>

            <aside className="panel side">
              <h2>Game Information</h2>
              <div className="stat"><span>Deposit</span><b>{stake} UCT</b></div>
              <div className="stat"><span>Moves Remaining</span><b>{credits}</b></div>
              <div className="stat"><span>Difficulty</span><b>{difficulty}</b></div>
              <hr/>
              <h3>Move Credits</h3>
              <p>Every 1 UCT = 20 moves. So 5 UCT = 100 moves, 10 UCT = 200 moves, 15 UCT = 300 moves, and so on.</p>
              <h3>Weekly Prize</h3>
              <p>50% of weekly deposits goes into the prize pool.</p>
              <p className="prize">🏆 Top 5 Players</p>
              <small>Note: the deposit button in this version prepares the UI flow. Real UCT transfers, prize-pool accounting, and prize payouts require secure backend/on-chain settlement.</small>
            </aside>
          </section>
        </>
      ) : (
        <section className="panel leaderboard">
          <div className="leader-head"><div><h2>🏆 Leaderboard</h2><p>Sample rankings for the application interface.</p></div><div className="week">This Week</div></div>
          <div className="pool"><span>Weekly Prize Pool</span><b>50% of weekly deposits</b></div>
          {leaderboard.map(([rank,name,prize,win])=><div className="rank" key={rank}><strong>#{rank}</strong><span className="avatar">{name[0]}</span><div><b>{name}</b><small>Win rate {win}</small></div><em>{prize}</em></div>)}
          <p className="footnote">The top 5 players are eligible to share the prize pool according to the game rules implemented by the backend.</p>
        </section>
      )}
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
