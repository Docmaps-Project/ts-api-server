import { OxigraphInmemBackend } from '../../src/adapter/oxigraph_inmem'
import oxigraph from 'oxigraph'
// Data from elife -- realistic example under test
// TODO - can we integrate this with the examples dir in the main repo to simplify maintenance?
export const elife_01 = `
<https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698> <http://purl.org/dc/terms/created> "2022-11-28T11:30:05+00:00"^^<http://www.w3.org/2001/XMLSchema#date> .
<https://sciety.org/groups/elife> <http://xmlns.com/foaf/0.1/accountServiceHomepage> "https://sciety.org" .
<https://elifesciences.org/> <http://xmlns.com/foaf/0.1/logo> "https://sciety.org/static/groups/elife--b560187e-f2fb-4ff9-a861-a204f3fc0fb0.png" .
<https://elifesciences.org/> <http://xmlns.com/foaf/0.1/name> "eLife" .
<https://elifesciences.org/> <http://xmlns.com/foaf/0.1/onlineAccount> <https://sciety.org/groups/elife> .
<https://elifesciences.org/> <http://xmlns.com/foaf/0.1/homepage> "https://elifesciences.org/" .
<https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698> <http://purl.org/dc/terms/publisher> <https://elifesciences.org/> .
<https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698> <http://purl.org/spar/pwo/hasFirstStep> _:b0 .
_:b1 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/Preprint> .
_:b1 <http://prismstandard.org/namespaces/basic/2.0/doi> "10.1101/2022.11.08.515698" .
_:b1 <http://purl.org/spar/fabio/hasURL> "https://www.biorxiv.org/content/10.1101/2022.11.08.515698v2"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
_:b1 <http://prismstandard.org/namespaces/basic/2.0/publicationDate> "2022-11-22"^^<http://www.w3.org/2001/XMLSchema#date> .
# TODO: Why does this line appear ? it breaks expectations ...
# _:b2 <http://purl.org/spar/pwo/produces> _:b1 .
_:b3 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/Preprint> .
_:b3 <http://prismstandard.org/namespaces/basic/2.0/doi> "10.1101/2022.11.08.515698" .
_:b4 <http://purl.org/spar/pso/isStatusHeldBy> _:b3 .
_:b4 <http://purl.org/spar/pso/withStatus> <http://purl.org/spar/pso/manuscript-published> .
_:b0 <http://www.ontologydesignpatterns.org/cp/owl/taskexecution.owl#isExecutedIn> _:b2 .
_:b0 <http://purl.org/spar/pso/resultsInAcquiring> _:b4 .
_:b0 <http://purl.org/spar/pwo/hasNextStep> _:b1 .
_:b5 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/Preprint> .
_:b5 <http://prismstandard.org/namespaces/basic/2.0/doi> "10.7554/eLife.85111" .
_:b6 <http://purl.org/spar/pwo/produces> _:b5 .
_:b7 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/Preprint> .
_:b7 <http://prismstandard.org/namespaces/basic/2.0/doi> "10.1101/2022.11.08.515698" .
_:b8 <http://purl.org/spar/pso/isStatusHeldBy> _:b7 .
_:b8 <http://purl.org/spar/pso/withStatus> <http://purl.org/spar/pso/under-review> .
_:b9 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/Preprint> .
_:b9 <http://prismstandard.org/namespaces/basic/2.0/doi> "10.7554/eLife.85111" .
_:b10 <http://purl.org/spar/pso/isStatusHeldBy> _:b9 .
_:b10 <http://purl.org/spar/pso/withStatus> <http://purl.org/spar/pso/draft> .
_:b11 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/Preprint> .
_:b11 <http://prismstandard.org/namespaces/basic/2.0/doi> "10.1101/2022.11.08.515698" .
_:b11 <http://purl.org/spar/fabio/hasURL> "https://www.biorxiv.org/content/10.1101/2022.11.08.515698v2"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
_:b1 <http://www.ontologydesignpatterns.org/cp/owl/taskexecution.owl#isExecutedIn> _:b6 .
_:b1 <http://purl.org/spar/pso/resultsInAcquiring> _:b8 .
_:b1 <http://purl.org/spar/pso/resultsInAcquiring> _:b10 .
_:b1 <http://purl.org/spar/pwo/needs> _:b11 .
_:b1 <http://purl.org/spar/pwo/hasNextStep> _:b2 .
_:b1 <http://purl.org/spar/pwo/hasPreviousStep> _:b0 .
_:b12 <http://xmlns.com/foaf/0.1/name> "anonymous" .
_:b12 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person> .
_:b13 <http://purl.org/spar/pro/isHeldBy> _:b12 .
_:b13 <http://purl.org/spar/pro/withRole> <http://purl.org/spar/pro/peer-reviewer> .
_:b14 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/WebPage> .
_:b14 <http://purl.org/spar/fabio/hasURL> "https://hypothes.is/a/E9MOvpsrEe2w6nds1t6xxQ"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
_:b15 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/WebPage> .
_:b15 <http://purl.org/spar/fabio/hasURL> "https://sciety.org/articles/activity/10.1101/2022.11.08.515698#hypothesis:E9MOvpsrEe2w6nds1t6xxQ"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
_:b16 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/WebPage> .
_:b16 <http://purl.org/spar/fabio/hasURL> "https://sciety.org/evaluations/hypothesis:E9MOvpsrEe2w6nds1t6xxQ/content"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
_:b17 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/ReviewArticle> .
_:b17 <http://prismstandard.org/namespaces/basic/2.0/publicationDate> "2023-01-23T14:34:43.676466+00:00"^^<http://www.w3.org/2001/XMLSchema#date> .
_:b17 <http://purl.org/spar/fabio/hasManifestation> _:b14 .
_:b17 <http://purl.org/spar/fabio/hasManifestation> _:b15 .
_:b17 <http://purl.org/spar/fabio/hasManifestation> _:b16 .
_:b18 <http://purl.org/spar/pro/isDocumentContextFor> _:b13 .
_:b18 <http://purl.org/spar/pwo/produces> _:b17 .
_:b19 <http://xmlns.com/foaf/0.1/name> "anonymous" .
_:b19 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person> .
_:b20 <http://purl.org/spar/pro/isHeldBy> _:b19 .
_:b20 <http://purl.org/spar/pro/withRole> <http://purl.org/spar/pro/peer-reviewer> .
_:b21 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/WebPage> .
_:b21 <http://purl.org/spar/fabio/hasURL> "https://hypothes.is/a/FD5EmpsrEe28RaOWOszMEw"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
_:b22 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/WebPage> .
_:b22 <http://purl.org/spar/fabio/hasURL> "https://sciety.org/articles/activity/10.1101/2022.11.08.515698#hypothesis:FD5EmpsrEe28RaOWOszMEw"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
_:b23 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/WebPage> .
_:b23 <http://purl.org/spar/fabio/hasURL> "https://sciety.org/evaluations/hypothesis:FD5EmpsrEe28RaOWOszMEw/content"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
_:b24 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/ReviewArticle> .
_:b24 <http://prismstandard.org/namespaces/basic/2.0/publicationDate> "2023-01-23T14:34:44.369019+00:00"^^<http://www.w3.org/2001/XMLSchema#date> .
_:b24 <http://purl.org/spar/fabio/hasManifestation> _:b21 .
_:b24 <http://purl.org/spar/fabio/hasManifestation> _:b22 .
_:b24 <http://purl.org/spar/fabio/hasManifestation> _:b23 .
_:b25 <http://purl.org/spar/pro/isDocumentContextFor> _:b20 .
_:b25 <http://purl.org/spar/pwo/produces> _:b24 .
_:b26 <http://xmlns.com/foaf/0.1/name> "Brice Bathellier" .
_:b26 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person> .
_:b27 <http://purl.org/spar/pro/isHeldBy> _:b26 .
_:b27 <http://purl.org/spar/pro/withRole> <http://purl.org/spar/pro/editor> .
_:b28 <http://xmlns.com/foaf/0.1/name> "Kate Wassum" .
_:b28 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person> .
_:b29 <http://purl.org/spar/pro/isHeldBy> _:b28 .
_:b29 <http://purl.org/spar/pro/withRole> <http://purl.org/spar/pro/senior-editor> .
_:b30 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/WebPage> .
_:b30 <http://purl.org/spar/fabio/hasURL> "https://hypothes.is/a/FMwbnpsrEe2mVPtbQf2X2w"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
_:b31 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/WebPage> .
_:b31 <http://purl.org/spar/fabio/hasURL> "https://sciety.org/articles/activity/10.1101/2022.11.08.515698#hypothesis:FMwbnpsrEe2mVPtbQf2X2w"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
_:b32 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/WebPage> .
_:b32 <http://purl.org/spar/fabio/hasURL> "https://sciety.org/evaluations/hypothesis:FMwbnpsrEe2mVPtbQf2X2w/content"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
_:b33 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/ExecutiveSummary> .
_:b33 <http://prismstandard.org/namespaces/basic/2.0/publicationDate> "2023-01-23T14:34:45.299882+00:00"^^<http://www.w3.org/2001/XMLSchema#date> .
_:b33 <http://purl.org/spar/fabio/hasManifestation> _:b30 .
_:b33 <http://purl.org/spar/fabio/hasManifestation> _:b31 .
_:b33 <http://purl.org/spar/fabio/hasManifestation> _:b32 .
_:b34 <http://purl.org/spar/pro/isDocumentContextFor> _:b27 .
_:b34 <http://purl.org/spar/pro/isDocumentContextFor> _:b29 .
_:b34 <http://purl.org/spar/pwo/produces> _:b33 .
_:b35 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/Preprint> .
_:b35 <http://prismstandard.org/namespaces/basic/2.0/doi> "10.1101/2022.11.08.515698" .
_:b36 <http://purl.org/spar/pso/isStatusHeldBy> _:b35 .
_:b36 <http://purl.org/spar/pso/withStatus> <http://purl.org/spar/pso/peer-reviewed> .
_:b37 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/Preprint> .
_:b37 <http://prismstandard.org/namespaces/basic/2.0/doi> "10.1101/2022.11.08.515698" .
_:b37 <http://purl.org/spar/fabio/hasURL> "https://www.biorxiv.org/content/10.1101/2022.11.08.515698v2"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
_:b2 <http://www.ontologydesignpatterns.org/cp/owl/taskexecution.owl#isExecutedIn> _:b18 .
_:b2 <http://www.ontologydesignpatterns.org/cp/owl/taskexecution.owl#isExecutedIn> _:b25 .
_:b2 <http://www.ontologydesignpatterns.org/cp/owl/taskexecution.owl#isExecutedIn> _:b34 .
_:b2 <http://purl.org/spar/pso/resultsInAcquiring> _:b36 .
_:b2 <http://purl.org/spar/pwo/needs> _:b37 .
_:b2 <http://purl.org/spar/pwo/hasPreviousStep> _:b1 .
<https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698> <http://purl.org/spar/pwo/hasStep> _:b0 .
<https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698> <http://purl.org/spar/pwo/hasStep> _:b1 .
<https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698> <http://purl.org/spar/pwo/hasStep> _:b2 .
<https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/pwo/Workflow> .
`

export const embo_01 = `
_:b1 <http://xmlns.com/foaf/0.1/name> "review commons" .
_:b1 <http://purl.org/spar/fabio/hasURL> "https://reviewcommons.org"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
<https://eeb.embo.org/api/v2/docmap/10.1101/2021.03.24.436774> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/pwo/Workflow> .
_:b2 <http://purl.org/spar/pso/isStatusHeldBy> <https://doi.org/10.1101/2021.03.24.436774> .
_:b2 <http://purl.org/spar/pso/withStatus> <http://purl.org/spar/pso/reviewed> .
<https://w3id.org/docmaps/examples/2IcFEF3uEeynuJv4u0y1sQ> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/WebPage> .
<https://w3id.org/docmaps/examples/2IcFEF3uEeynuJv4u0y1sQ> <http://xmlns.com/foaf/0.1/accountServiceHomepage> "https://hypothes.is/" .
<https://w3id.org/docmaps/examples/2IcFEF3uEeynuJv4u0y1sQ> <http://purl.org/spar/fabio/hasURL> "https://hypothes.is/a/2IcFEF3uEeynuJv4u0y1sQ"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
<https://w3id.org/docmaps/examples/19209935> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/WebPage> .
<https://w3id.org/docmaps/examples/19209935> <http://xmlns.com/foaf/0.1/accountServiceHomepage> "https://eeb.embo.org/" .
<https://w3id.org/docmaps/examples/19209935> <http://purl.org/spar/fabio/hasURL> "https://eeb.embo.org/api/v2/review_material/19209935"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
<https://w3id.org/docmaps/examples/10.1101/2021.03.24.436774> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/WebPage> .
<https://w3id.org/docmaps/examples/10.1101/2021.03.24.436774> <http://xmlns.com/foaf/0.1/accountServiceHomepage> "https://biorxiv.org" .
<https://w3id.org/docmaps/examples/10.1101/2021.03.24.436774> <http://purl.org/spar/fabio/hasURL> "https://biorxiv.org/content/10.1101/2021.03.24.436774#review"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
_:b3 <http://prismstandard.org/namespaces/basic/2.0/publicationDate> "2021-12-15T21:34:55.777131+00:00"^^<http://www.w3.org/2001/XMLSchema#date> .
_:b3 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/Review> .
_:b3 <http://purl.org/spar/fabio/hasManifestation> <https://w3id.org/docmaps/examples/2IcFEF3uEeynuJv4u0y1sQ> .
_:b3 <http://purl.org/spar/fabio/hasManifestation> <https://w3id.org/docmaps/examples/19209935> .
_:b3 <http://purl.org/spar/fabio/hasManifestation> <https://w3id.org/docmaps/examples/10.1101/2021.03.24.436774> .
_:b3 <http://prismstandard.org/namespaces/basic/2.0/doi> "10.15252/rc.2022616985" .
_:b4 <http://xmlns.com/foaf/0.1/name> "anonymous" .
_:b4 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person> .
_:b5 <http://purl.org/spar/pro/isHeldBy> _:b4 .
_:b5 <http://purl.org/spar/pro/withRole> <http://purl.org/spar/pro/peer-reviewer> .
_:b6 <http://purl.org/spar/pwo/produces> _:b3 .
_:b6 <http://purl.org/spar/pro/isDocumentContextFor> _:b5 .
<https://w3id.org/docmaps/examples/19209937> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/WebPage> .
<https://w3id.org/docmaps/examples/19209937> <http://xmlns.com/foaf/0.1/accountServiceHomepage> "https://eeb.embo.org/" .
<https://w3id.org/docmaps/examples/19209937> <http://purl.org/spar/fabio/hasURL> "https://eeb.embo.org/api/v2/review_material/19209937"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
<https://w3id.org/docmaps/examples/10.1101/2021.03.24.436774> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/WebPage> .
<https://w3id.org/docmaps/examples/10.1101/2021.03.24.436774> <http://xmlns.com/foaf/0.1/accountServiceHomepage> "https://biorxiv.org" .
<https://w3id.org/docmaps/examples/10.1101/2021.03.24.436774> <http://purl.org/spar/fabio/hasURL> "https://biorxiv.org/content/10.1101/2021.03.24.436774#review"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
<https://w3id.org/docmaps/examples/2CcR8F3uEey3q98yPkAmtA> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/WebPage> .
<https://w3id.org/docmaps/examples/2CcR8F3uEey3q98yPkAmtA> <http://xmlns.com/foaf/0.1/accountServiceHomepage> "https://hypothes.is/" .
<https://w3id.org/docmaps/examples/2CcR8F3uEey3q98yPkAmtA> <http://purl.org/spar/fabio/hasURL> "https://hypothes.is/a/2CcR8F3uEey3q98yPkAmtA"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
_:b7 <http://prismstandard.org/namespaces/basic/2.0/publicationDate> "2021-12-15T21:34:55.088501+00:00"^^<http://www.w3.org/2001/XMLSchema#date> .
_:b7 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/Review> .
_:b7 <http://purl.org/spar/fabio/hasManifestation> <https://w3id.org/docmaps/examples/19209937> .
_:b7 <http://purl.org/spar/fabio/hasManifestation> <https://w3id.org/docmaps/examples/10.1101/2021.03.24.436774> .
_:b7 <http://purl.org/spar/fabio/hasManifestation> <https://w3id.org/docmaps/examples/2CcR8F3uEey3q98yPkAmtA> .
_:b7 <http://prismstandard.org/namespaces/basic/2.0/doi> "10.15252/rc.2022674442" .
_:b8 <http://xmlns.com/foaf/0.1/name> "anonymous" .
_:b8 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person> .
_:b9 <http://purl.org/spar/pro/isHeldBy> _:b8 .
_:b9 <http://purl.org/spar/pro/withRole> <http://purl.org/spar/pro/peer-reviewer> .
_:b10 <http://purl.org/spar/pwo/produces> _:b7 .
_:b10 <http://purl.org/spar/pro/isDocumentContextFor> _:b9 .
<https://w3id.org/docmaps/examples/19209936> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/WebPage> .
<https://w3id.org/docmaps/examples/19209936> <http://xmlns.com/foaf/0.1/accountServiceHomepage> "https://eeb.embo.org/" .
<https://w3id.org/docmaps/examples/19209936> <http://purl.org/spar/fabio/hasURL> "https://eeb.embo.org/api/v2/review_material/19209936"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
<https://w3id.org/docmaps/examples/10.1101/2021.03.24.436774> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/WebPage> .
<https://w3id.org/docmaps/examples/10.1101/2021.03.24.436774> <http://xmlns.com/foaf/0.1/accountServiceHomepage> "https://biorxiv.org" .
<https://w3id.org/docmaps/examples/10.1101/2021.03.24.436774> <http://purl.org/spar/fabio/hasURL> "https://biorxiv.org/content/10.1101/2021.03.24.436774#review"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
<https://w3id.org/docmaps/examples/2FtEKl3uEeyLQ7d6qPcs1g> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/WebPage> .
<https://w3id.org/docmaps/examples/2FtEKl3uEeyLQ7d6qPcs1g> <http://xmlns.com/foaf/0.1/accountServiceHomepage> "https://hypothes.is/" .
<https://w3id.org/docmaps/examples/2FtEKl3uEeyLQ7d6qPcs1g> <http://purl.org/spar/fabio/hasURL> "https://hypothes.is/a/2FtEKl3uEeyLQ7d6qPcs1g"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
_:b11 <http://prismstandard.org/namespaces/basic/2.0/publicationDate> "2021-12-15T21:34:55.471384+00:00"^^<http://www.w3.org/2001/XMLSchema#date> .
_:b11 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/Review> .
_:b11 <http://purl.org/spar/fabio/hasManifestation> <https://w3id.org/docmaps/examples/19209936> .
_:b11 <http://purl.org/spar/fabio/hasManifestation> <https://w3id.org/docmaps/examples/10.1101/2021.03.24.436774> .
_:b11 <http://purl.org/spar/fabio/hasManifestation> <https://w3id.org/docmaps/examples/2FtEKl3uEeyLQ7d6qPcs1g> .
_:b11 <http://prismstandard.org/namespaces/basic/2.0/doi> "10.15252/rc.2022463725" .
_:b12 <http://xmlns.com/foaf/0.1/name> "anonymous" .
_:b12 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person> .
_:b13 <http://purl.org/spar/pro/isHeldBy> _:b12 .
_:b13 <http://purl.org/spar/pro/withRole> <http://purl.org/spar/pro/peer-reviewer> .
_:b14 <http://purl.org/spar/pwo/produces> _:b11 .
_:b14 <http://purl.org/spar/pro/isDocumentContextFor> _:b13 .
_:b15 <http://prismstandard.org/namespaces/basic/2.0/publicationDate> "2021-03-24T00:00:00Z"^^<http://www.w3.org/2001/XMLSchema#date> .
_:b15 <http://prismstandard.org/namespaces/basic/2.0/doi> "10.1101/2021.03.24.436774" .
_:b-aa24d889-e5ce-4ae9-8a95-98359738043d <http://purl.org/spar/pwo/hasNextStep> _:b-a178f1f7-000b-48eb-af0e-347b32d069a8 .
_:b-aa24d889-e5ce-4ae9-8a95-98359738043d <http://purl.org/spar/pso/resultsInAcquiring> _:b2 .
_:b-aa24d889-e5ce-4ae9-8a95-98359738043d <http://www.ontologydesignpatterns.org/cp/owl/taskexecution.owl#isExecutedIn> _:b6 .
_:b-aa24d889-e5ce-4ae9-8a95-98359738043d <http://www.ontologydesignpatterns.org/cp/owl/taskexecution.owl#isExecutedIn> _:b10 .
_:b-aa24d889-e5ce-4ae9-8a95-98359738043d <http://www.ontologydesignpatterns.org/cp/owl/taskexecution.owl#isExecutedIn> _:b14 .
_:b-aa24d889-e5ce-4ae9-8a95-98359738043d <http://purl.org/spar/pwo/needs> _:b15 .
_:b16 <http://purl.org/spar/pso/isStatusHeldBy> <https://doi.org/10.1101/2021.03.24.436774> .
_:b16 <http://purl.org/spar/pso/withStatus> <http://purl.org/spar/pso/> .
<https://w3id.org/docmaps/examples/19209934> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/WebPage> .
<https://w3id.org/docmaps/examples/19209934> <http://xmlns.com/foaf/0.1/accountServiceHomepage> "https://eeb.embo.org" .
<https://w3id.org/docmaps/examples/19209934> <http://purl.org/spar/fabio/hasURL> "https://eeb.embo.org/api/v2/review_material/19209934"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
<https://w3id.org/docmaps/examples/2Pw-rF3uEeyeiFtWpHAokg> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/WebPage> .
<https://w3id.org/docmaps/examples/2Pw-rF3uEeyeiFtWpHAokg> <http://xmlns.com/foaf/0.1/accountServiceHomepage> "https://hypothes.is" .
<https://w3id.org/docmaps/examples/2Pw-rF3uEeyeiFtWpHAokg> <http://purl.org/spar/fabio/hasURL> "https://hypothes.is/a/2Pw-rF3uEeyeiFtWpHAokg"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
<https://w3id.org/docmaps/examples/10.1101/2021.03.24.436774> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/WebPage> .
<https://w3id.org/docmaps/examples/10.1101/2021.03.24.436774> <http://xmlns.com/foaf/0.1/accountServiceHomepage> "https://biorxiv.org" .
<https://w3id.org/docmaps/examples/10.1101/2021.03.24.436774> <http://purl.org/spar/fabio/hasURL> "https://biorxiv.org/content/10.1101/2021.03.24.436774#review"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
_:b17 <http://prismstandard.org/namespaces/basic/2.0/publicationDate> "2021-12-15T21:34:56.527596+00:00"^^<http://www.w3.org/2001/XMLSchema#date> .
_:b17 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/Reply> .
_:b17 <http://purl.org/spar/fabio/hasManifestation> <https://w3id.org/docmaps/examples/19209934> .
_:b17 <http://purl.org/spar/fabio/hasManifestation> <https://w3id.org/docmaps/examples/2Pw-rF3uEeyeiFtWpHAokg> .
_:b17 <http://purl.org/spar/fabio/hasManifestation> <https://w3id.org/docmaps/examples/10.1101/2021.03.24.436774> .
_:b17 <http://prismstandard.org/namespaces/basic/2.0/doi> "10.15252/rc.2022569723" .
_:b18 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person> .
_:b19 <http://purl.org/spar/pro/isHeldBy> _:b18 .
_:b19 <http://purl.org/spar/pro/withRole> <http://purl.org/spar/pro/author> .
_:b20 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person> .
_:b21 <http://purl.org/spar/pro/isHeldBy> _:b20 .
_:b21 <http://purl.org/spar/pro/withRole> <http://purl.org/spar/pro/author> .
_:b22 <http://purl.org/spar/pwo/produces> _:b17 .
_:b22 <http://purl.org/spar/pro/isDocumentContextFor> _:b19 .
_:b22 <http://purl.org/spar/pro/isDocumentContextFor> _:b21 .
_:b23 <http://prismstandard.org/namespaces/basic/2.0/publicationDate> "2021-12-15T21:34:55.471384+00:00"^^<http://www.w3.org/2001/XMLSchema#date> .
_:b23 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/Review> .
_:b23 <http://prismstandard.org/namespaces/basic/2.0/doi> "10.15252/rc.2022463725" .
_:b24 <http://prismstandard.org/namespaces/basic/2.0/publicationDate> "2021-12-15T21:34:55.088501+00:00"^^<http://www.w3.org/2001/XMLSchema#date> .
_:b24 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/Review> .
_:b24 <http://prismstandard.org/namespaces/basic/2.0/doi> "10.15252/rc.2022674442" .
_:b25 <http://prismstandard.org/namespaces/basic/2.0/publicationDate> "2021-12-15T21:34:55.777131+00:00"^^<http://www.w3.org/2001/XMLSchema#date> .
_:b25 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/fabio/Review> .
_:b25 <http://prismstandard.org/namespaces/basic/2.0/doi> "10.15252/rc.2022616985" .
_:b-a178f1f7-000b-48eb-af0e-347b32d069a8 <http://purl.org/spar/pso/resultsInAcquiring> _:b16 .
_:b-a178f1f7-000b-48eb-af0e-347b32d069a8 <http://www.ontologydesignpatterns.org/cp/owl/taskexecution.owl#isExecutedIn> _:b22 .
_:b-a178f1f7-000b-48eb-af0e-347b32d069a8 <http://purl.org/spar/pwo/needs> _:b23 .
_:b-a178f1f7-000b-48eb-af0e-347b32d069a8 <http://purl.org/spar/pwo/needs> _:b24 .
_:b-a178f1f7-000b-48eb-af0e-347b32d069a8 <http://purl.org/spar/pwo/needs> _:b25 .
_:b-a178f1f7-000b-48eb-af0e-347b32d069a8  <http://purl.org/spar/pwo/hasPreviousStep> _:b-aa24d889-e5ce-4ae9-8a95-98359738043d .
<https://eeb.embo.org/api/v2/docmap/10.1101/2021.03.24.436774> <http://purl.org/spar/pwo/hasStep> _:b-aa24d889-e5ce-4ae9-8a95-98359738043d .
<https://eeb.embo.org/api/v2/docmap/10.1101/2021.03.24.436774> <http://purl.org/spar/pwo/hasStep> _:b-a178f1f7-000b-48eb-af0e-347b32d069a8 .
<https://eeb.embo.org/api/v2/docmap/10.1101/2021.03.24.436774> <http://purl.org/spar/pwo/hasFirstStep> _:b-aa24d889-e5ce-4ae9-8a95-98359738043d .
<https://eeb.embo.org/api/v2/docmap/10.1101/2021.03.24.436774> <http://purl.org/dc/terms/created> "2023-02-13T05:43:49.289Z"^^<http://www.w3.org/2001/XMLSchema#date> .
<https://eeb.embo.org/api/v2/docmap/10.1101/2021.03.24.436774> <http://purl.org/dc/terms/publisher> _:b1 .
_:b26 <http://purl.org/spar/pwo/Workflow> <https://eeb.embo.org/api/v2/docmap/10.1101/2021.03.24.436774> .
`

export const TEXT_EX_BASE_IRI = 'https://docmaps-project.github.io/ex/v1/'
export function CreateDatastore() {
  const backend = new OxigraphInmemBackend(TEXT_EX_BASE_IRI)
  const graph = oxigraph.defaultGraph()
  backend.store.load(
    embo_01, // data
    'application/n-triples', // mime type
    TEXT_EX_BASE_IRI,
    graph,
  )
  backend.store.load(
    elife_01, // data
    'application/n-triples', // mime type
    TEXT_EX_BASE_IRI,
    graph,
  )

  return backend
}
