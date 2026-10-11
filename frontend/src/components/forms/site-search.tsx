"use client";

import React, { useEffect, useState, useRef } from "react";
import styles from "./site-search.module.scss";
import { searchSite, type SearchItem } from "@/app/actions/public";

/**
 * Поиск по сайту (ТЗ F-1.7).
 *
 * Компонент не обращается к Strapi: запрос уходит в server action,
 * там проверяется длина строки, ограничивается число результатов
 * и собираются безопасные ссылки.
 */
export const SiteSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    // Небольшая задержка, чтобы не слать запрос на каждую букву.
    timer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        setResults(await searchSite(trimmed));
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query]);

  return (
    <div className={styles.search}>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Поиск по аттракционам и новостям"
        aria-label="Поиск по сайту"
      />

      {isSearching && <p className={styles.hint}>Ищем…</p>}

      {!isSearching && query.trim().length >= 2 && results.length === 0 && (
        <p className={styles.hint}>Ничего не найдено</p>
      )}

      {results.length > 0 && (
        <ul className={styles.results}>
          {results.map((item) => (
            <li key={`${item.kind}-${item.id}`}>
              <a href={item.href}>
                <span className={styles.kind}>{item.kind === "attraction" ? "Аттракцион" : "Новость"}</span>
                <strong>{item.title}</strong>
                {item.description && <span>{item.description}</span>}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};