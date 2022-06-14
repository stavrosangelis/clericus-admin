import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useState,
  useRef,
} from 'react';
import { Card, CardBody, Button, Badge, Spinner } from 'reactstrap';
import { getData } from '../helpers';

import Taxonomy from '../components/taxonomies/Taxonomy';

const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));

const heading = 'Taxonomies';
const breadcrumbsItems = [
  { label: 'Model', icon: 'pe-7s-share', active: false, path: '' },
  { label: heading, icon: '', active: true, path: '' },
];

function Taxonomies() {
  // state
  const [loading, setLoading] = useState(true);
  const [taxonomies, setTaxonomies] = useState([]);
  const [taxonomyId, setTaxonomyId] = useState(null);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);

  const mounted = useRef(false);

  const load = useCallback(async () => {
    const responseData = await getData(`taxonomies`);
    return responseData;
  }, []);

  const reload = () => {
    setLoading(true);
  };

  useEffect(() => {
    mounted.current = true;
    if (loading) {
      const update = async () => {
        setLoading(false);
        const responseData = await load();
        if (mounted.current) {
          const { data: newData } = responseData;
          const { data: taxonomiesData } = newData || [];
          if (taxonomyId === null) {
            const firstTaxonomyId = taxonomiesData[0]._id || null;
            setTaxonomyId(firstTaxonomyId);
          }
          setTaxonomies(taxonomiesData);
          setTaxonomyLoading(true);
        }
      };
      update();
    }
    return () => {
      mounted.current = false;
    };
  }, [load, loading, taxonomyId]);

  const listTaxonomies = useCallback(() => {
    const output = [];
    const { length } = taxonomies;
    for (let i = 0; i < length; i += 1) {
      const t = taxonomies[i];
      const active =
        taxonomyId !== null && taxonomyId === t._id ? ' active' : '';
      const item = (
        <Button
          color="secondary"
          outline
          key={i}
          onClick={() => {
            setTaxonomyId(t._id);
            setTaxonomyLoading(true);
          }}
          className={`taxonomy-btn${active}`}
        >
          {t.label} <Badge color="secondary">{t.terms}</Badge>
        </Button>
      );
      output.push(item);
    }
    return output;
  }, [taxonomies, taxonomyId]);

  let content = (
    <div>
      <div className="row">
        <div className="col-12">
          <div style={{ padding: '40pt', textAlign: 'center' }}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
    </div>
  );

  if (!loading) {
    const taxonomiesHTML = listTaxonomies();

    content = (
      <div>
        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody>
                {taxonomiesHTML}
                <Button
                  type="button"
                  size="sm"
                  color="info"
                  className="pull-right"
                  outline
                  onClick={() => {
                    setTaxonomyId(null);
                    setTaxonomyLoading(true);
                  }}
                >
                  Add new <i className=" fa fa-plus" />
                </Button>
              </CardBody>
            </Card>
            <Taxonomy
              _id={taxonomyId}
              loading={taxonomyLoading}
              reload={reload}
              setLoading={setTaxonomyLoading}
              setTaxonomyId={setTaxonomyId}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Suspense fallback={[]}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
      <div className="row">
        <div className="col-12">
          <h2>{heading}</h2>
        </div>
      </div>
      {content}
    </div>
  );
}
export default Taxonomies;
