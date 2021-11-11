/// <reference path="script.d.ts"/>
import { computed, createApp, defineComponent, ref, watch } from 'https://cdn.jsdelivr.net/npm/vue@3.2.21/dist/vue.esm-browser.js';

export const Pagination = defineComponent({
    name: 'result-pagination',
    props: {
        totalPages: Number,
        page: Number,
    },
    template: /*html*/`
    <div class="pagination">
        page {{ page }} of {{ totalPages }}
        <div class="pages" v-on:click="onClick">
            <template v-for="item in pages" :key="item.key">
                <button v-if="!item.isDots"
                    :class="{ active: item.value === page }"
                    :data-pagination="item.value">
                    {{ item.value }}
                </button>
                <span v-else class="dots">…</span>
            </template>
        </div>
    </div>
    `,
    setup(props, ctx) {
        const pages = computed(() => {
            const list = [];
            const { page, totalPages } = props;
            let lastPush = false;
            for (let i = 1; i <= totalPages; i++) {
                if (i <= 1 || i > totalPages - 1 || Math.abs(page - i) < 2) {
                    list.push({ key: i, value: i, isDots: false });
                    lastPush = true;
                } else if (lastPush) {
                    list.push({ key: i, value: '...', isDots: true });
                    lastPush = false;
                }
            }
            return list;
        });
        /**
         * @param {MouseEvent} e 
         */
        const onClick = e => {
            if (e.target instanceof HTMLElement) {
                const anchor = e.target.closest('[data-pagination]');
                if (anchor) {
                    e.preventDefault();
                    const newPage = +anchor.getAttribute('data-pagination');
                    ctx.emit('set-page', newPage);
                }
            }
        };

        return {
            pages,
            onClick
        };
    }
});

const App = defineComponent({
    components: {
        Pagination,
    },
    template: /*html*/`
    <div :class="{ loading: delayedLoading }">
        <div class="loading-container">
        <div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        </div>
        <div class="input-file-container">
            <label>
                <input type="file"
                    class="custom-file-input"
                    data-input-file-label="Select .csv file"
                    ref="inputFile"
                    accept=".csv"
                    v-on:input="update">
            </label>
            <button v-on:click.prevent="update">load</button>
        </div>
        <div class="info">
            <div>
                rowsCount: {{ rowsCount }}
                <Pagination v-if="rowsCount" :totalPages="pages" :page="page" v-on:set-page="setPage"></Pagination>
            </div>
            <div class="generate-xml-info" v-if="rowsCount">
                <label>    
                    Number of Posts per xml file:
                    <input type="number" v-model.number="perXmlFile" min="0">
                </label>
                <button v-on:click="generateXmlFiles">Generate {{ Math.ceil(rowsCount / perXmlFile) }} xml files</button>
            </div>
        </div>
        <div class="table-list-container">
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th v-for="col of header">{{ col }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row of rows">
                            <td v-for="col of row">{{ col.value }}{{ col.more }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <ul class="xml-files-list">
                <li v-for="file of outputXmlUrls">
                    <a :href="file.url" :download="file.name">{{ file.name }}</a>
                    <span>({{ file.posts }} posts)</span>
                    <span>({{ file.size }})</span>
                </li>
                <li v-if="outputXmlUrls.length">
                    <button v-on:click.prevent="downloadAll">download all</button>
                </li>
            </ul>
        </div>
    </div>
    `,
    setup() {
        /** @type {import('vue').Ref<HTMLInputElement>} */
        const inputFile = ref();
        const header = ref([]);
        const rows = ref([]);
        const rowsCount = ref(0);
        const perPage = ref(10);
        const page = ref(1);
        const pages = computed(() => Math.ceil(rowsCount.value / perPage.value));
        const loading = ref(false);
        const delayedLoading = ref(loading.value);
        let delayedLoadingTimeout;
        watch(loading, () => {
            clearTimeout(delayedLoadingTimeout);
            delayedLoadingTimeout = setTimeout(() => {
                delayedLoading.value = loading.value;
            }, loading.value ? 100 : 300);
        });
        const perXmlFile = ref(50);
        const outputXmlUrls = ref([]);
        let currentFile = null;
        const propToCsvHeader = ref({
            published: 'Date',
            updated: 'Updated',
            title: 'Title',
            content: 'Content',
            categories: 'Categories',
        });
        const csvHeaderToProp = computed(() => {
            return Object.fromEntries(
                Object.entries(propToCsvHeader.value)
                    .map(([key, value]) => [value.toLowerCase(), key])
            );
        });
        /**
         * 
         * @param {number} bytes - size in bytes
         */
        const formatSize = bytes => {
            const units = ['kb', 'MB'];
            for (let i = units.length; i >= 1; i--) {
                if (bytes > 1024**i) return `${+(bytes / 1024**i).toFixed(2)} ${units[i - 1]}`;
            }
            return `${bytes} bytes`;
        };
        const update = () => {
            if (loading.value) return;
            if (!inputFile.value.files.length) {
                alert('no files');
                return;
            }
            loading.value = true;
            const file = inputFile.value.files[0];
            let foundHeader = false;
            const rawRows = [];
            let rawRowsCount = 0;
            const isNewFile = file !== currentFile;
            if (isNewFile) {
                currentFile = file;
                rowsCount.value = 0;
                header.value = [];
            }
            rows.value = [];
            let foundRows = false;
            const startRow = perPage.value * (page.value - 1);
            const endRow = perPage.value * page.value;
            const t0 = Date.now();
            Papa.parse(file, {
                worker: true,
                step(results, parser) {
                    if (!results.data.length || (results.data.length === 1 && !results.data[0])) return;
                    if (!foundHeader) {
                        foundHeader = true;
                        header.value = results.data;
                    } else {
                        rawRowsCount++;
                        if (isNewFile) rowsCount.value++;
                        if (!foundRows) {
                            if (rawRowsCount > startRow) {
                                console.log(results);
                                rawRows.push(results.data.map(col => {
                                    const value = col.slice(0, 1024);
                                    let more = '';
                                    if (col.length !== value.length) {
                                        const moreBytes = col.length - value.length;
                                        more = ` (${formatSize(moreBytes)} more)`;
                                    }
                                    return {
                                        value,
                                        more,
                                    };
                                }));
                            }
                            if (rawRowsCount >= endRow) {
                                foundRows = true;
                                rows.value = rawRows;
                                if (!isNewFile) {
                                    parser.abort();
                                }
                            }
                        }
                    }
                },
                complete() {
                    if (!foundRows) {
                        foundRows = true;
                        rows.value = rawRows;
                    }
                    console.log("Finished in", Date.now() - t0, 'ms');
                    loading.value = false;
                },
            });
        };
        /**
         * @param {number} newPage 
         */
        const setPage = newPage => {
            if (loading.value || page.value === newPage) return;
            page.value = newPage;
            update();
        };
        const generateXmlFiles = () => {
            if (loading.value) return;
            if (!inputFile.value.files.length) {
                alert('no files');
                return;
            }
            loading.value = true;
            const file = inputFile.value.files[0];
            let foundHeader = false;
            let header = [];
            const xmlStart = `
            <?xml version='1.0' encoding='UTF-8'?>
            <?xml-stylesheet href="https://www.blogger.com/styles/atom.css" type="text/css"?>
            <feed
                xmlns='http://www.w3.org/2005/Atom'
                xmlns:openSearch='http://a9.com/-/spec/opensearchrss/1.0/'
                xmlns:gd='http://schemas.google.com/g/2005'
                xmlns:georss='http://www.georss.org/georss'
                xmlns:thr='http://purl.org/syndication/thread/1.0'
                xmlns:blogger='http://schemas.google.com/blogger/2008'>
                <updated>2021-11-05T18:00:07.900-07:00</updated>
                <title type='text'>كورة لايف : مباريات اليوم واخبار الرياضة حصريا</title>
                <subtitle type='html'>كورة لايف موقع رياضي متجدد يتتبع جديد المباريات واخبار الرياضة بشكل يومي.</subtitle>
                <generator version='7.00' uri='https://www.blogger.com'>Blogger</generator>
                <openSearch:totalResults>33</openSearch:totalResults>
                <openSearch:startIndex>1</openSearch:startIndex>
                <openSearch:itemsPerPage>2</openSearch:itemsPerPage>
            `.trimStart();
            const xmlEnd = `
            </feed>`;
            const xmlSerializer = new XMLSerializer();
            const textNode = document.createTextNode('');
            /**
             * @param {string} data 
             */
            const escapeXml = (data) => {
                textNode.data = data;
                data = xmlSerializer.serializeToString(textNode);
                textNode.data = '';
                return data;
            };
            /**
             * 
             * @param {Record<string, string> & { categories: string[] }} post 
             */
            const buildEntry = post => {
                return `
                <entry>
                    <id>tag:blogger.com,1999:blog-8240996799073780730.post-847217568016513032</id>
                    <category scheme="http://schemas.google.com/g/2005#kind" term="http://schemas.google.com/blogger/2008/kind#post"/>
                    ${post.published ? `
                    <published>${escapeXml(post.published)}</published>
                    ` : ''}
                    ${post.updated ? `
                    <updated>${escapeXml(post.updated)}</updated>
                    ` : ''}
                    ${post.categories.map(tag => `
                    <category scheme='http://www.blogger.com/atom/ns#' term='${escapeXml(tag)}'/>
                    `.trimStart()).join('')}
                    <title type='text'>${escapeXml(post.title)}</title>
                    <content type='html'>${escapeXml(post.content)}</content>
                    <author>
                        <name>admin</name>
                        <email>noreply@blogger.com</email>
                        <gd:image rel='http://schemas.google.com/g/2005#thumbnail' width='35' height='35' src='//www.blogger.com/img/blogger_logo_round_35.png'/>
                    </author>
                    <media:thumbnail
                        xmlns:media='http://search.yahoo.com/mrss/' url='https://1.bp.blogspot.com/-QK7ox5j6x70/X9aUSEEyj7I/AAAAAAAACLI/R5Ae7YqMasYZQEQAhojRhHWHbf-UYBXQQCLcBGAsYHQ/s72-c-e90-rw/%25D9%2585%25D8%25B6%25D8%25BA%25D9%2588%25D8%25B7%25D9%2587.png' height='72' width='72'/>
                </entry>
                `;
            };
            let currentXml = {
                /** @type {Set<string>} */
                categories: new Set(),
                rowsCount: 0,
                content: ''
            };
            /**
             * 
             * @param {Record<string, string>} row 
             */
            const addRow = (row) => {
                const post = {
                    ...row,
                    categories: row.categories ? row.categories.split(',').map(tag => tag.trim()).filter(Boolean) : []
                };
                for (const tag of post.categories) currentXml.categories.add(tag);
                currentXml.rowsCount++;
                // @ts-ignore
                currentXml.content += buildEntry(post);
                if (currentXml.rowsCount >= perXmlFile.value) {
                    closeCurrentXml();
                }
            };
            outputXmlUrls.value = [];
            const closeCurrentXml = () => {
                const xmlCategories = [...currentXml.categories].map(tag => `
                <category term='${escapeXml(tag)}'/>
                `.trimStart()).join('\n');
                currentXml.content = xmlStart + xmlCategories + currentXml.content + xmlEnd;
                const blob = new Blob([currentXml.content], { type: 'text/xml' });
                const url = URL.createObjectURL(blob);
                const fileNumber = (outputXmlUrls.value.length + 1 + '').padStart(2, '0');
                outputXmlUrls.value.push({
                    name: `file-${fileNumber}.xml`,
                    size: formatSize(currentXml.content.length),
                    posts: currentXml.rowsCount,
                    url,
                });
                currentXml = {
                    categories: new Set(),
                    rowsCount: 0,
                    content: '',
                };
            };
            const t0 = Date.now();
            Papa.parse(file, {
                worker: true,
                step(results) {
                    if (!results.data.length) return;
                    if (!foundHeader) {
                        foundHeader = true;
                        header = results.data;
                    } else {
                        addRow(Object.fromEntries(header.map((col, i) => [
                            csvHeaderToProp.value[col.toLowerCase()],
                            results.data[i]
                        ])));
                    }
                },
                complete() {
                    if (currentXml.rowsCount) {
                        closeCurrentXml();
                    }
                    console.log("Finished in", Date.now() - t0, 'ms');
                    loading.value = false;
                },
            });
        };
        const downloadAll = () => {
            document.querySelectorAll('.xml-files-list li a[download]').forEach(el => {
                /** @type {HTMLAnchorElement} */
                // @ts-ignore
                const anchor = el;
                anchor.click();
            });
        };
        return {
            inputFile,
            update,
            rowsCount,
            header,
            rows,
            page,
            pages,
            setPage,
            loading,
            perXmlFile,
            generateXmlFiles,
            outputXmlUrls,
            downloadAll,
            delayedLoading,
        };
    }
});

const app = createApp(App);
app.mount('#app');

