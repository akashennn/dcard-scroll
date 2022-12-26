import Axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import useDebounce from "../hooks/useDebounce";
import { Item, Repositories } from "../types/api";

type TProps = {
  children: JSX.Element;
};

type TDefaultValues = {
  // search input
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;

  // infinite scroll
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  hasMoreData: boolean;

  // data fetching and main data
  isLoading: boolean;
  repositoriesData: Item[];
};

const defaultValues = {
  // search input
  searchQuery: "",
  setSearchQuery: () => undefined,

  // infinite scroll
  setPageNumber: () => undefined,
  hasMoreData: false,

  // data fetching and main data
  isLoading: false,
  repositoriesData: [],
};

export const AppContext = createContext<TDefaultValues>(defaultValues);

export const AppContextProvider = ({ children }: TProps): JSX.Element => {
  // search input
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // infinite scroll
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [hasMoreData, setHasMoreData] = useState<boolean>(false);

  // data fetching and main data
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [repositoriesData, setRepositoriesData] = useState<Item[]>([]);

  // clear existing data with new keystrokes to clear cache
  useEffect(() => {
    setRepositoriesData([]);
  }, [searchQuery]);

  // search repository when debouncedSearchQuery (with new keystroke) and pageNumber (with infinite scroll) changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      searchRepositories(debouncedSearchQuery, pageNumber);
    }
  }, [debouncedSearchQuery, pageNumber]);

  // search repositories
  const searchRepositories = async (query: string, pageNumber: number) => {
    setIsLoading(true);

    try {
      const { data } = await Axios.get<Repositories>(
        `https://api.github.com/search/repositories?q=${query}&page=${pageNumber}`
      );

      // update data set with new data, set is being used to remove duplicates
      setRepositoriesData((prevState) => {
        return [...new Set([...prevState, ...data.items])];
      });

      // number of results per page is 30, therefore 30 * pageNumber covers all the results appeared on the search until now
      // if that's less than the total_count, more results to show
      setHasMoreData(data.total_count > pageNumber * 30);
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  // exports
  const context = {
    // search input
    searchQuery,
    setSearchQuery,

    // infinite scroll
    setPageNumber,
    hasMoreData,

    // data fetching and main data
    isLoading,
    repositoriesData,
  };

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
};
