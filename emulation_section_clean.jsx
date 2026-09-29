            {/* Recent Activity removed from Emulation page per request */}

            {/* Console Menu */}
            <section className={mergeStyles(styles.card, styles.emulationConsoleMenuCard)}>
              <p className={styles.muted} style={{marginBottom: 12}}>Select Console:</p>
              <div className={styles.emulationConsoleMenu}>
                {emulationGamesByPlatform.map(([platform]) => (
                  <button
                    key={platform}
                    type="button"
                    className={mergeStyles(
                      styles.emulationConsoleTab,
                      selectedEmulationConsole === platform ? styles.emulationConsoleTabActive : {}
                    )}
                    onClick={() => setSelectedEmulationConsole(platform)}
                  >
                    {platformLabelMap[platform] || platform}
                  </button>
                ))}
              </div>
            </section>

            {/* Games for Selected Console */}
            {emulationGamesByPlatform.find(([platform]) => platform === selectedEmulationConsole) && (
              <section className={styles.emulationPlatformGroup}>
                <h2 className={styles.emulationPlatformTitle}>{platformLabelMap[selectedEmulationConsole] || selectedEmulationConsole} Games</h2>
                <div className={styles.emulationGrid}>
                  {emulationGamesByPlatform.find(([platform]) => platform === selectedEmulationConsole)?.[1]?.map((game) => (
                    <article key={game.id} className={mergeStyles(styles.card, styles.emulationItem)}>
                      <img
                        src={game.imageUrl}
                        alt={`${game.title} cover`}
                        className={styles.emulationCover}
                        onError={(event) => {
                          event.currentTarget.onerror = null
                          event.currentTarget.src = EMULATION_FALLBACK_COVER
                        }}
                      />
                      <div className={styles.emulationContent}>
                        <h2>{game.title}</h2>
                        <p className={styles.catalogMeta}>
                          {game.system} • {game.year}
                        </p>
                        <p className={styles.muted}>{game.description}</p>
                        <div className={styles.emulationActions}>
                          <button
                            type="button"
                            className={mergeStyles(styles.tabChip, hoveredEmuGame === `play-${game.id}` ? styles.tabChipHover : {})}
                            onMouseEnter={() => setHoveredEmuGame(`play-${game.id}`)}
                            onMouseLeave={() => setHoveredEmuGame(null)}
                            onClick={() => setSelectedEmulationGame(game)}
                          >
                            Play in Loader
                          </button>
                          <a
                            href={game.playUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={mergeStyles(styles.tabChip, styles.emulationPlayBtn)}
                          >
                            Open Emulator Page
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
