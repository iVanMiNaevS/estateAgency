'use client'
import React, { useState, FormEvent } from "react";
import styles from "../../../app/(withHeaderFooter)/catalog/catalog.module.scss";
import { CardEstate } from "@/ui/cardEstate/cardEstate";
import { getObjects } from "@/services/getInfo";
import { IEstate } from "@/types/estate.interface";
type props = {
  sectionId: string;
};

export const SearchSection = ({ sectionId }: props) => {
  const [searchValue, setSearchValue] = useState('');
  const [estates, setEstates] = useState<IEstate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!searchValue.trim()) {
      setError("Введите поисковый запрос");
      setEstates([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getObjects<IEstate>(
        'estates',
        [], 
        [
          {
            filter: '$contains', // typeFilters
            field: 'title', // поле для фильтрации
            value: searchValue // значение поиска
          }
        ],
		[
          {
            params: 'page',
            value: 1
          },
          {
            params: 'pageSize',
            value: 2
          }
        ]
      );

      setEstates(response.data);
      setMeta(response.meta);
      
      if (response.data.length === 0) {
        setError("По вашему запросу ничего не найдено");
      }
    } catch (err) {
      console.error("Ошибка поиска:", err);
      setError("Произошла ошибка при поиске. Попробуйте позже.");
      setEstates([]);
    } finally {
      setLoading(false);
    }
  };

   const loadMore = async () => {
    if (!meta || meta.pagination.page >= meta.pagination.pageCount) return;
    
    try {
      setLoading(true);
      
      const nextPage = meta.pagination.page + 1;
      const response = await getObjects<IEstate>(
        'estates',
        ['poster', 'options.icon'], 
        [
          {
            filter: '$contains',
            field: 'title',
            value: searchValue
          }
        ],
        [
          {
            params: 'page',
            value: nextPage
          },
          {
            params: 'pageSize',
            value: 2
          }
        ]
      );

      setEstates(prev => [...prev, ...response.data]);
      setMeta(response.meta);
    } catch (err) {
      console.error("Ошибка загрузки:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
	<>
    <section className={styles.searchSection} id={sectionId}>
    <div className={styles.bg}></div>
    <div className="container">
      <div className={styles.textContainer}>
        <h1 className="h2">Найдите идеальный инструмент для роста</h1>
        <p>
          Добро пожаловать в UpTrend — ваше маркетинговое агентство, где каждый бизнес находит 
          свой путь к клиентам. Ознакомьтесь с нашими услугами, каждая из которых создана для 
          решения конкретных задач: от привлечения трафика до повышения лояльности. Выберите 
          то, что подходит именно вам, и начните свой путь к росту уже сегодня.
        </p>
      </div>
      
      <form onSubmit={handleSearch}>
        <input 
          type="text" 
          value={searchValue} 
          onChange={(e) => setSearchValue(e.target.value)} 
          placeholder="Поиск услуги (например: контекстная реклама)"
          disabled={loading}
        />
        <button 
          type="submit" 
          className="btn btn-purple"
          disabled={loading || !searchValue.trim()}
        >
          {loading ? "Поиск..." : "Найти услугу"}
        </button>
      </form>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
    </div>
  </section>
	{loading && estates.length === 0 ? (
		<div className={styles.loading}>Загрузка...</div>
	) : (
		<div className={styles.resultsContainer + ' container'}>
		{estates.length > 0 && (
			<>
				<div className={styles.estatesList}>
					{estates.map((estate) => (
						<div className={styles.card}>
							<CardEstate 
							key={estate.id} 
							estate={estate}
							/>
						</div>
					))}
				</div>
				{meta?.pagination?.pageCount > meta?.pagination?.page && (
                  <div className={styles.loadMoreContainer}>
                    <button 
                      onClick={loadMore} 
                      className="btn btn-outline-purple"
                      disabled={loading}
                    >
                      {loading ? "Загрузка..." : "Показать ещё"}
                    </button>
                  </div>
                )}
			</>
		)}
		
		</div>
	)}
		
	</>
  );
};