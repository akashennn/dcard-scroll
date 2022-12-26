import { Avatar, Card, Input, Layout } from "antd";
import Meta from "antd/es/card/Meta";
import { Content, Footer, Header } from "antd/es/layout/layout";
import { useCallback, useContext, useRef } from "react";
import "./App.css";
import { AppContext } from "./contexts/appContext";

const App = (): JSX.Element => {
  const {
    repositoriesData,
    setSearchQuery,
    setPageNumber,
    searchQuery,
    isLoading,
    hasMoreData,
  } = useContext(AppContext);

  const observer = useRef<null | IntersectionObserver>(null);

  const lastElementRef = useCallback(
    (node: any) => {
      // if page is loading, do nothing
      if (isLoading) return;

      if (observer.current) observer.current.disconnect();

      // if last element is intersecting and has more data to fetch change page number to trigger data fetching
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreData) {
          setPageNumber((prevPageNumber) => prevPageNumber + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading, hasMoreData]
  );

  const onSearch = (query: string) => {
    setSearchQuery(query);
    // always reset page number to 1 on new keystroke to avoid wrong page data fetching
    setPageNumber(1);
  };

  return (
    <Layout>
      <Header>DCard Repository Search</Header>

      <Content className="body">
        <div className="content">
          <Input
            type="text"
            size="large"
            value={searchQuery}
            placeholder="Search repository..."
            className="search-input"
            onChange={(e) => onSearch(e.target.value)}
          />

          {isLoading && <p>Fetching new data...</p>}

          <div className="card-group">
            {repositoriesData.map((repository, index) => (
              <Card
                key={repository.full_name}
                ref={
                  repositoriesData.length === index + 1 ? lastElementRef : null
                }
              >
                <Meta
                  avatar={<Avatar src={repository.owner.avatar_url} />}
                  title={repository.name}
                  description={repository.description}
                />
              </Card>
            ))}
          </div>
        </div>
      </Content>

      <Footer>Akash Perera © 2022</Footer>
    </Layout>
  );
};

export default App;
